import { NextRequest, NextResponse } from "next/server";

import {
  CallEndedEvent,
  CallRecordingReadyEvent,
  CallSessionParticipantLeftEvent,
  CallSessionStartedEvent,
  CallTranscriptionReadyEvent,
  MessageNewEvent,
} from "@stream-io/node-sdk";
import { RealtimeClient } from "@stream-io/openai-realtime-api";
import { and, eq, not } from "drizzle-orm";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { generateAvatarUri } from "@/lib/avatar";
import { streamChat } from "@/lib/stream-chat";
import { streamVideo } from "@/lib/stream-video";

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// 활성 상태의 OpenAI Realtime 클라이언트를 메모리에 저장 (세션 유지용)
const activeRealtimeClients = new Map<string, RealtimeClient>();

function verifySignatureWithSDK(body: string, signature: string): boolean {
  return streamVideo.verifyWebhook(body, signature);
}

/**
 * OpenAI Realtime 에이전트를 연결하고 이벤트를 처리하는 백그라운드 함수
 */
async function setupRealtimeConnection(meetingId: string, agentId: string, instructions: string) {
  try {
    const call = streamVideo.video.call("default", meetingId);

    const realtimeClient = await streamVideo.video.connectOpenAi({
      call,
      openAiApiKey: process.env.OPENAI_API_KEY!,
      agentUserId: agentId,
      model: "gpt-4o-realtime-preview",
    });

    // AI 세션 설정: 음성 감지(VAD) 및 한국어 대응 설정 포함
    realtimeClient.updateSession({
      voice: "alloy",
      instructions: instructions,
      modalities: ["text", "audio"],
      turn_detection: {
        type: "server_vad",
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500,
      },
      input_audio_transcription: { model: "whisper-1" },
    });

    // 이벤트 리스너 등록
    realtimeClient.on("conversation.updated", (event: any) => {
      console.log(`[${meetingId}] conversation.updated`, event);
    });

    realtimeClient.on("conversation.item.completed", ({ item }: any) => {
      console.log(`[${meetingId}] conversation.item.completed`, item);
    });

    realtimeClient.on("error", (error: any) => {
      console.error(`[${meetingId}] OpenAI Realtime Error:`, error);
    });

    // AI가 먼저 인사를 건네도록 트리거 전송
    await realtimeClient.sendUserMessageContent([
      {
        type: "input_text",
        text: "지원자가 면접장에 입장했습니다. 반갑게 인사를 건네며 모의 면접을 시작해 주세요.",
      },
    ]);

    // 메모리에 클라이언트 저장
    activeRealtimeClients.set(meetingId, realtimeClient);
    console.log(`[${meetingId}] AI 에이전트 연결 성공 및 대기 중`);
  } catch (error) {
    console.error(`[${meetingId}] AI 연결 프로세스 실패:`, error);
  }
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature");
  const apiKey = req.headers.get("x-api-key");

  if (!signature || !apiKey) {
    return NextResponse.json({ error: "Missing signature or API key" }, { status: 400 });
  }

  const body = await req.text();

  if (!verifySignatureWithSDK(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = payload?.type;

  // 1. 면접 세션 시작 이벤트
  if (eventType === "call.session_started") {
    const event = payload as CallSessionStartedEvent;
    const meetingId = event.call.custom?.meetingId;

    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(
        and(
          eq(meetings.id, meetingId),
          not(eq(meetings.status, "completed")),
          not(eq(meetings.status, "processing")),
        ),
      );

    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // 미팅 상태 업데이트
    await db
      .update(meetings)
      .set({ status: "active", startedAt: new Date() })
      .where(eq(meetings.id, meetingId));

    const [existingAgent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, existingMeeting.agentId));

    if (!existingAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // AI 연결 프로세스 실행 (백그라운드)
    setupRealtimeConnection(meetingId, existingAgent.id, existingAgent.instructions).catch((err) =>
      console.error("Setup 실패:", err),
    );

    return NextResponse.json({ status: "ok" });
  }

  // 2. 참여자가 나갔을 때
  else if (eventType === "call.session_participant_left") {
    const event = payload as CallSessionParticipantLeftEvent;
    const meetingId = event.call_cid.split(":")[1];

    if (meetingId) {
      const call = streamVideo.video.call("default", meetingId);
      await call.end();
    }
  }

  // 3. 면접 세션 종료 이벤트
  else if (eventType === "call.session_ended") {
    const event = payload as CallEndedEvent;
    const meetingId = event.call.id;

    // AI 연결 해제 및 메모리 정리
    if (activeRealtimeClients.has(meetingId)) {
      activeRealtimeClients.delete(meetingId);
      console.log(`[${meetingId}] 세션 종료로 인한 AI 클라이언트 제거 완료`);
    }

    await db
      .update(meetings)
      .set({ status: "processing", endedAt: new Date() })
      .where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")));
  }

  // 4. 전사(Transcript) 준비 완료 이벤트
  else if (eventType === "call.transcription_ready") {
    const event = payload as CallTranscriptionReadyEvent;
    const meetingId = event.call_cid.split(":")[1];

    const [updatedMeeting] = await db
      .update(meetings)
      .set({ transcriptUrl: event.call_transcription.url })
      .where(eq(meetings.id, meetingId))
      .returning();

    if (updatedMeeting) {
      await inngest.send({
        name: "meetings/processing",
        data: {
          meetingId: updatedMeeting.id,
          transcriptUrl: updatedMeeting.transcriptUrl,
        },
      });
    }
  }

  // 5. 녹화 준비 완료 이벤트
  else if (eventType === "call.recording_ready") {
    const event = payload as CallRecordingReadyEvent;
    const meetingId = event.call_cid.split(":")[1];

    await db
      .update(meetings)
      .set({ recordingUrl: event.call_recording.url })
      .where(eq(meetings.id, meetingId));
  }

  // 6. 텍스트 채팅 메시지 이벤트 (사후 피드백 채팅용)
  else if (eventType === "message.new") {
    const event = payload as MessageNewEvent;
    const userId = event.user?.id;
    const channelId = event.channel_id;
    const text = event.message?.text;

    if (!userId || !channelId || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(and(eq(meetings.id, channelId), eq(meetings.status, "completed")));

    if (existingMeeting) {
      const [existingAgent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, existingMeeting.agentId));

      if (existingAgent && userId !== existingAgent.id) {
        // 기존 텍스트 채팅 로직 (GPT-4o 활용)
        const instructions = `
          당신은 회의 요약본을 바탕으로 사용자를 돕는 AI 어시스턴트입니다.
          회의 요약: ${existingMeeting.summary}
          행동 지침: ${existingAgent.instructions}
          답변은 간결하고 정확해야 합니다.
        `;

        const channel = streamChat.channel("messaging", channelId);
        await channel.watch();

        const previousMessages = channel.state.messages
          .slice(-5)
          .filter((msg) => msg.text && msg.text.trim() !== "")
          .map<ChatCompletionMessageParam>((message) => ({
            role: message.user?.id === existingAgent.id ? "assistant" : "user",
            content: message.text || "",
          }));

        const GPTResponse = await openaiClient.chat.completions.create({
          messages: [
            { role: "system", content: instructions },
            ...previousMessages,
            { role: "user", content: text },
          ],
          model: "gpt-4o",
        });

        const GPTResponseText = GPTResponse.choices[0].message.content;

        if (GPTResponseText) {
          const avatarUrl = generateAvatarUri({
            seed: existingAgent.name,
            variant: "botttsNeutral",
          });

          await streamChat.upsertUser({
            id: existingAgent.id,
            name: existingAgent.name,
            image: avatarUrl,
          });
          await channel.sendMessage({
            text: GPTResponseText,
            user: { id: existingAgent.id, name: existingAgent.name, image: avatarUrl },
          });
        }
      }
    }
  }

  return NextResponse.json({ status: "ok" });
}
