import { Suspense } from "react";

import { HttpResponse, http } from "msw";

import { render, screen } from "@/lib/test/render";
import { server } from "@/lib/test/vitest.setup";

import { MeetingIdView } from "./meeting-id-view";

const mockMeeting = {
  id: "meeting-1",
  status: "upcoming" as const,
  name: "meeting1",
  createdAt: new Date().toString(),
  updatedAt: new Date().toString(),
  duration: 0,
  userId: "user-1",
  agentId: "agent-1",
  startedAt: null,
  endedAt: null,
  transcriptUrl: null,
  recordingUrl: null,
  summary: null,
  agent: {
    id: "agent-1",
    name: "agent1",
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
    userId: "user-1",
    instructions: "테스트 지침",
  },
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("MeetingIdView 컴포넌트", () => {
  it("면접 상태가 시작전(upcoming) 상태인 경우, UpcomingState 컴포넌트가 렌더링되어야 한다.", async () => {
    server.use(
      http.get("http://localhost/api/trpc/meetings.getOne", () => {
        return HttpResponse.json([{ result: { data: { ...mockMeeting, status: "upcoming" } } }]);
      }),
    );

    render(
      <Suspense>
        <MeetingIdView meetingId="meeting-1" />
      </Suspense>,
    );

    expect(await screen.findByText("면접 시작하기")).toBeInTheDocument();
  });

  it("면접 상태가 진행중(active) 상태인 경우, ActiveState 컴포넌트가 렌더링되어야 한다.", async () => {
    server.use(
      http.get("http://localhost/api/trpc/meetings.getOne", () => {
        return HttpResponse.json([{ result: { data: { ...mockMeeting, status: "active" } } }]);
      }),
    );

    render(
      <Suspense>
        <MeetingIdView meetingId="meeting-1" />
      </Suspense>,
    );

    expect(await screen.findByText("면접이 진행 중입니다.")).toBeInTheDocument();
  });

  it("면접 상태가 처리중(processing) 상태인 경우, ProcessingState 컴포넌트가 렌더링되어야 한다.", async () => {
    server.use(
      http.get("http://localhost/api/trpc/meetings.getOne", () => {
        return HttpResponse.json([{ result: { data: { ...mockMeeting, status: "processing" } } }]);
      }),
    );

    render(
      <Suspense>
        <MeetingIdView meetingId="meeting-1" />
      </Suspense>,
    );

    expect(await screen.findByText("면접 결과를 분석하고 있어요")).toBeInTheDocument();
  });

  it("면접 상태가 완료(completed) 상태인 경우, CompletedState 컴포넌트가 렌더링되어야 한다.", async () => {
    server.use(
      http.get("http://localhost/api/trpc/meetings.getOne", () => {
        return HttpResponse.json([
          { result: { data: { ...mockMeeting, status: "completed", summary: "면접 결과 요약" } } },
        ]);
      }),
    );

    render(
      <Suspense>
        <MeetingIdView meetingId="meeting-1" />
      </Suspense>,
    );

    expect(await screen.findByText("면접 결과 요약")).toBeInTheDocument();
  });
});
