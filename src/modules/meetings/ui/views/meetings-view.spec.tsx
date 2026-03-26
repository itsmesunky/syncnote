import { Suspense } from "react";

import { HttpResponse, http } from "msw";

import { render, screen, within } from "@/lib/test/render";
import { server } from "@/lib/test/vitest.setup";

import { MeetingGetMany } from "../../types";
import { MeetingsView } from "./meetings-view";

const mockMeetings: MeetingGetMany = [];
for (let i = 1; i <= 5; i++) {
  mockMeetings.push({
    id: `meeting-${i}`,
    status: "upcoming" as const,
    name: `테스트 면접 ${i}`,
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
    duration: 0,
    userId: `user-${i}`,
    agentId: `agent-${i}`,
    startedAt: null,
    endedAt: null,
    transcriptUrl: null,
    recordingUrl: null,
    summary: null,
    agent: {
      id: `agent-${i}`,
      name: `agent${i}`,
      createdAt: new Date().toString(),
      updatedAt: new Date().toString(),
      userId: `user-${i}`,
      instructions: `테스트 지침 ${i}`,
    },
  });
}

const pushFn = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushFn }),
}));

describe("MeetingsView 컴포넌트", () => {
  describe("데이터가 존재하지 않는 경우", () => {
    beforeEach(() => {
      server.use(
        http.get("http://localhost/api/trpc/meetings.getMany", () => {
          return HttpResponse.json([{ result: { data: { items: [], totalPages: 0 } } }]);
        }),
      );

      render(
        <Suspense>
          <MeetingsView />
        </Suspense>,
      );
    });

    it("EmptyState 컴포넌트가 렌더링 되어야 한다.", async () => {
      expect(await screen.findByRole("heading", { name: /새로운 면접/i })).toBeInTheDocument();
    });

    it("페이지네이션이 보이지 않아야 한다.", async () => {
      await screen.findByRole("heading", { name: /새로운 면접/i });
      expect(screen.queryByRole("button", { name: "이전" })).not.toBeInTheDocument();
    });
  });

  describe("데이터가 존재하는 경우", () => {
    beforeEach(() => {
      server.use(
        http.get("http://localhost/api/trpc/meetings.getMany", () => {
          return HttpResponse.json([
            { result: { data: { items: mockMeetings, totalPages: 2 } } },
          ]);
        }),
      );

      render(
        <Suspense>
          <MeetingsView />
        </Suspense>,
      );
    });

    it("페이지네이션이 보여야 한다.", async () => {
      expect(await screen.findByRole("button", { name: "이전" })).toBeInTheDocument();
    });

    it("면접 목록이 렌더링되어야 한다.", async () => {
      const [firstItem, secondItem] = await screen.findAllByRole("row");

      expect(within(firstItem).getByText("테스트 면접 1")).toBeInTheDocument();
      expect(within(secondItem).getByText("테스트 면접 2")).toBeInTheDocument();
    });
  });

  describe("행 클릭 네비게이션", () => {
    it("면접 행 클릭 시 해당 면접 상세 페이지로 이동해야 한다.", async () => {
      server.use(
        http.get("http://localhost/api/trpc/meetings.getMany", () => {
          return HttpResponse.json([
            { result: { data: { items: mockMeetings, totalPages: 2 } } },
          ]);
        }),
      );

      const { user } = render(
        <Suspense>
          <MeetingsView />
        </Suspense>,
      );

      const rows = await screen.findAllByRole("row");
      await user.click(rows[0]);

      expect(pushFn).toHaveBeenCalledWith("/meetings/meeting-1");
    });
  });
});
