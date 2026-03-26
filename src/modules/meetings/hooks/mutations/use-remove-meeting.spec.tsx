import { Suspense } from "react";

import { HttpResponse, http } from "msw";

import { render, screen, waitFor } from "@/lib/test/render";
import { server } from "@/lib/test/vitest.setup";

import { MeetingIdView } from "../../ui/views/meeting-id-view";

const mockMeeting = {
  status: "upcoming",
  summary: null,
  name: "Meeting 1",
  id: "meeting-1",
  createdAt: new Date().toString(),
  updatedAt: new Date().toString(),
  duration: 0,
  userId: "user-1",
  agentId: "agent-1",
  startedAt: null,
  endedAt: null,
  transcriptUrl: null,
  recordingUrl: null,
  agent: {
    name: "테스트 에이전트",
    id: "agent-1",
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
    userId: "user-1",
    instructions: "테스트 지침",
  },
};

const routerFn = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerFn }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

vi.mock("@/modules/meetings/ui/components/meeting-id-view-header", () => ({
  MeetingIdViewHeader: ({ onRemove }: { onRemove: () => void }) => (
    <button onClick={onRemove}>삭제</button>
  ),
}));

vi.mock("@/modules/meetings/ui/components/upcoming-state", () => ({
  UpcomingState: () => <></>,
}));

beforeEach(() => {
  server.use(
    http.get("http://localhost/api/trpc/meetings.getOne", async () => {
      return HttpResponse.json([{ result: { data: mockMeeting } }]);
    }),
    http.post("http://localhost/api/trpc/meetings.remove", async () => {
      return HttpResponse.json([{ result: { data: { id: "meeting-1" } } }]);
    }),
  );
});

describe("MeetingIdView 컴포넌트", () => {
  describe("삭제 플로우", () => {
    it("헤더 - 드롭다운 - 삭제 버튼을 클릭하면 ConfirmationDialog가 렌더링되어야 한다.", async () => {
      const { user } = render(
        <Suspense>
          <MeetingIdView meetingId="meeting-1" />
        </Suspense>,
      );

      const deleteButton = await screen.findByRole("button", { name: "삭제" });
      await user.click(deleteButton);
      expect(await screen.findByRole("dialog")).toBeInTheDocument();
    });

    it("ConfirmationDialog가 렌더링되어야 한다.", async () => {
      const { user } = render(
        <Suspense>
          <MeetingIdView meetingId="meeting-1" />
        </Suspense>,
      );

      const deleteButton = await screen.findByRole("button", { name: "삭제" });
      await user.click(deleteButton);
      expect(await screen.findByRole("dialog")).toBeInTheDocument();
    });

    it("ConfirmationDialog에서 확인 버튼 클릭 시, 면접이 삭제되고, /meetings로 이동해야 한다.", async () => {
      const { user } = render(
        <Suspense>
          <MeetingIdView meetingId="meeting-1" />
        </Suspense>,
      );

      const deleteButton = await screen.findByRole("button", { name: "삭제" });
      await user.click(deleteButton);

      const confirmButton = await screen.findByRole("button", { name: "확인" });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(routerFn).toHaveBeenCalledWith("/meetings");
      });
    });

    it("면접이 성공적으로 삭제된 후, meetings.getMany, premium.getFreeUsage 쿼리가 무효화 되어야 한다.", async () => {
      const { user, queryClient } = render(
        <Suspense>
          <MeetingIdView meetingId="meeting-1" />
        </Suspense>,
      );
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const deleteButton = await screen.findByRole("button", { name: "삭제" });
      await user.click(deleteButton);

      const confirmButton = await screen.findByRole("button", { name: "확인" });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledTimes(2);
      });
    });

    it("면접 삭제 실패 시, 에러 메시지를 토스트로 보여준다.", async () => {
      server.use(
        http.post("http://localhost/api/trpc/meetings.remove", async () => {
          return HttpResponse.json(
            [
              {
                error: {
                  message: "면접 삭제 실패",
                  code: -32600,
                  data: { code: "UNAUTHORIZED", httpStatus: 401 },
                },
              },
            ],
            { status: 401 },
          );
        }),
      );

      const { user } = render(
        <Suspense>
          <MeetingIdView meetingId="meeting-1" />
        </Suspense>,
      );

      const deleteButton = await screen.findByRole("button", { name: "삭제" });
      await user.click(deleteButton);

      const confirmButton = await screen.findByRole("button", { name: "확인" });
      await user.click(confirmButton);

      const { toast } = await import("sonner");
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("면접 삭제 실패", { position: "top-center" });
      });
    });
  });
});
