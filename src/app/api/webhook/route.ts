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

const verifySignatureWithSDK = (body: string, signature: string) => {
  return streamVideo.verifyWebhook(body, signature);
};

const setupRealtimeConnection = async (
  meetingId: string,
  agentId: string,
  instructions: string,
) => {
  try {
    const call = streamVideo.video.call("default", meetingId);

    const realtimeClient = await streamVideo.video.connectOpenAi({
      call,
      openAiApiKey: process.env.OPENAI_API_KEY!,
      agentUserId: agentId,
      model: "gpt-4o-realtime-preview",
    });

    realtimeClient.updateSession({
      instructions,
      voice: "alloy",
      turn_detection: {
        type: "server_vad",
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 1000,
      },
      input_audio_transcription: { model: "whisper-1" }, // STT
    });

    realtimeClient.sendUserMessageContent([
      {
        type: "input_text",
        text: "지원자가 면접장에 입장했습니다. 반갑게 인사를 건네며 모의 면접을 시작해 주세요.",
      },
    ]);
  } catch (error) {
    console.error(`[${meetingId}]: AI 연결 프로세스 실패: `, error);
  }
};

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

  let payload: unknown;
  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = (payload as Record<string, unknown>)?.type;

  if (eventType === "call.session_started") {
    const event = payload as CallSessionStartedEvent;
    const meetingId = event.call.custom.meetingId;

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(
        and(
          eq(meetings.id, meetingId),
          not(eq(meetings.status, "active")),
          not(eq(meetings.status, "completed")),
          not(eq(meetings.status, "processing")),
        ),
      );

    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

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

    try {
      await setupRealtimeConnection(meetingId, existingAgent.id, existingAgent.instructions);
    } catch (error) {
      console.error("Setup 실패: ", error);
    }
  } else if (eventType === "call.session_participant_left") {
    const event = payload as CallSessionParticipantLeftEvent;
    const meetingId = event.call_cid.split(":")[1];

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    const call = streamVideo.video.call("default", meetingId);
    await call.end();
  } else if (eventType === "call.session_ended") {
    const event = payload as CallEndedEvent;
    const meetingId = event.call.custom.meetingId;

    if (!meetingId) {
      return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
    }

    await db
      .update(meetings)
      .set({ status: "processing", endedAt: new Date() })
      .where(and(eq(meetings.id, meetingId), eq(meetings.status, "active")));
  } else if (eventType === "call.transcription_ready") {
    const event = payload as CallTranscriptionReadyEvent;
    const meetingId = event.call_cid.split(":")[1];

    const [updatedMeeting] = await db
      .update(meetings)
      .set({ transcriptUrl: event.call_transcription.url })
      .where(eq(meetings.id, meetingId))
      .returning();

    if (!updatedMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    await inngest.send({
      name: "meetings/processing",
      data: {
        meetingId: updatedMeeting.id,
        transcriptUrl: updatedMeeting.transcriptUrl,
      },
    });
  } else if (eventType === "call.recording_ready") {
    const event = payload as CallRecordingReadyEvent;
    const meetingId = event.call_cid.split(":")[1];

    await db
      .update(meetings)
      .set({ recordingUrl: event.call_recording.url })
      .where(eq(meetings.id, meetingId));
  } else if (eventType === "message.new") {
    const event = payload as MessageNewEvent;
    const userId = event.user?.id;
    const channelId = event.channel_id;
    const currentMessageId = event.message?.id;
    const text = event.message?.text;

    if (!userId || !channelId || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(and(eq(meetings.id, channelId), eq(meetings.status, "completed")));

    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const [existingAgent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, existingMeeting.agentId));

    if (!existingAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (userId !== existingAgent.id) {
      const instructions = `
      당신은 방금 전 모의 면접을 진행한 AI 면접관이자, 이제는 지원자(사용자)의 면접 결과를 함께 리뷰하고 성장을 돕는 피드백 멘토입니다.
      아래는 방금 진행된 모의 면접의 기록을 바탕으로 생성된 요약본입니다
      
      [면접 요약본]
      ${existingMeeting.summary}
      
      아래는 면접 진행 당시 당신에게 부여되었던 원래의 역할 지침입니다.
      사용자의 질문을 이해하는 '배경 지식'으로만 참고하고, 더 이상 사용자에게 새로운 면접 질문을 던지지는 마십시오:

      [원래 역할 지침]
      ${existingAgent.instructions}
      
      [당신의 임무 및 행동 지침]
      1. 사용자는 자신의 면접 답변에 대한 피드백, 개선점, 혹은 추가 설명을 요청할 수 있습니다. 
      2. 항상 위의 [면접 요약본]과 사용자와 나눈 [이전 대화 맥락]을 바탕으로 일관성 있게 답변하십시오.
      3. 만약 사용자가 요약본에 없는 내용이나, 면접에서 다루지 않은 내용을 묻는다면, 정중하게 "해당 내용은 이번 면접 기록에 포함되어 있지 않다"고 안내하십시오. (절대 사실을 지어내지 마십시오)
      4. 답변은 간결하고 건설적이어야 하며, 지원자가 실제로 도움을 받을 수 있는 실질적인 조언과 정확한 정보 제공에 집중하십시오.
      `;

      const processAIResponse = async () => {
        try {
          const channel = streamChat.channel("messaging", channelId);
          await channel.watch();

          const previousMessages = channel.state.messages
            .filter((msg) => msg.id !== currentMessageId && msg.text && msg.text.trim() !== "")
            .slice(-5)
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
        } catch (error) {
          console.error("AI 응답 처리 중 에러 발생:", error);
        }
      };

      processAIResponse();
    }
  }
  return NextResponse.json({ status: "ok" });
}
