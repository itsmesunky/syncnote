import { TextMessage, createAgent, openai } from "@inngest/agent-kit";
import { eq, inArray } from "drizzle-orm";
import JSONL from "jsonl-parse-stringify";

import { db } from "@/db";
import { agents, meetings, user } from "@/db/schema";
import { inngest } from "@/inngest/client";
import { StreamTranscriptItem } from "@/modules/meetings/types";

const summarizer = createAgent({
  name: "summarizer",
  system: `당신은 10년 차 수석 개발자이자 전문 기술 면접관입니다.
  제공되는 대화 기록(transcript)은 'AI 면접관'과 '사용자(지원자)' 간의 모의 면접 내용입니다.
  당신은 제3자의 평가자 입장에서 전체 흐름을 파악하고, '지원자의 답변'을 집중적으로 분석하여 실질적이고 구조화된 피드백을 작성해야 합니다.
  
  모든 출력 결과에는 다음 마크다운 구조를 엄격히 준수하세요:
  
  ### 💡 면접 총평 (Overview)
  지원자의 전반적인 면접 퍼포먼스에 대한 상세한 총평을 서술형으로 작성하세요. 기술적 이해도, 논리적 전개, 커뮤니케이션 능력 등을 종합적으로 평가하여 부드럽지만 명확한 어조로 작성합니다.

  ### 🎯 주요 강점 (Key Strengths)
  지원자가 특별히 잘 대답한 개념이나 뛰어난 역량을 보인 부분을 글머리 기호로 요약하세요.
  - [강점 1]: 구체적인 이유
  - [강점 2]: 구체적인 이유

  ### 🛠 보완이 필요한 부분 (Areas for Improvement)
  개념적 오류가 있었거나, 더 깊이 있는 설명이 필요했던 아쉬운 부분을 짚어주고 개선 방향을 제시하세요.
  - [보완점 1]: 개선을 위한 구체적인 조언이나 추천 학습 방향
  - [보완점 2]: 더 나은 답변을 위한 팁

  ### 📝 상세 Q&A 리뷰 (Q&A Notes)
  면접 중 오갔던 핵심 질문과 답변을 주제별로 나눕니다.
  
  #### [질문 주제 또는 실제 질문 내용]
  - 지원자의 핵심 답변 요약
  - 면접관의 코멘트 (잘된 점 또는 아쉬운 점)
  - 꼬리 질문으로 대비하면 좋을 추가 CS 지식 (예: 브라우저 렌더링 최적화, 네트워크 통신 구조 등)
  `.trim(),
  model: openai({ model: "gpt-4o", apiKey: process.env.OPENAI_API_KEY }),
});

export const meetingsProcessing = inngest.createFunction(
  { id: "meetings/processing" },
  { event: "meetings/processing" },
  async ({ event, step }) => {
    const response = await step.run("fetch-transcript", async () => {
      return fetch(event.data.transcriptUrl).then((res) => res.text());
    });

    const transcript = await step.run("parse-transcript", async () => {
      return JSONL.parse<StreamTranscriptItem>(response);
    });

    const transcriptWithSpeakers = await step.run("add-speakers", async () => {
      const speakerIds = [...new Set(transcript.map((item) => item.speaker_id))];

      const userSpeakers = await db
        .select()
        .from(user)
        .where(inArray(user.id, speakerIds))
        .then((users) =>
          users.map((user) => ({
            ...user,
          })),
        );

      const agentSpeakers = await db
        .select()
        .from(agents)
        .where(inArray(agents.id, speakerIds))
        .then((agents) =>
          agents.map((agent) => ({
            ...agent,
          })),
        );

      const speakers = [...userSpeakers, ...agentSpeakers];

      return transcript.map((item) => {
        const speaker = speakers.find((speaker) => speaker.id === item.speaker_id);

        if (!speaker) {
          return {
            ...item,
            user: {
              name: "Unknown",
            },
          };
        }

        return {
          ...item,
          user: {
            name: speaker.name,
          },
        };
      });
    });

    const { output } = await summarizer.run(
      "이 대본을 다음과 같이 요약해주세요: " + JSON.stringify(transcriptWithSpeakers),
    );

    await step.run("save-summary", async () => {
      await db
        .update(meetings)
        .set({
          summary: (output[0] as TextMessage).content as string,
          status: "completed",
        })
        .where(eq(meetings.id, event.data.meetingId));
    });
  },
);
