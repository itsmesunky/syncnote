import { Suspense } from "react";

import { HttpResponse, http } from "msw";

import { render, screen, waitFor } from "@/lib/test/render";
import { server } from "@/lib/test/vitest.setup";

import { AgentIdView } from "../../ui/views/agent-id-view";

const mockAgent = {
  id: "agent-1",
  name: "테스트 에이전트",
  instructions: "테스트 지침",
  userId: "user-1",
  createdAt: new Date().toString(),
  updatedAt: new Date().toString(),
  meetingCount: 0,
};

const routerFn = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerFn }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

vi.mock("@/modules/agents/ui/components/agent-id-view-header", () => ({
  AgentIdViewHeader: ({ onRemove }: { onRemove: () => void }) => (
    <button onClick={onRemove}>삭제</button>
  ),
}));

describe("AgentIdView 컴포넌트", () => {
  describe("삭제 플로우", () => {
    beforeEach(() => {
      server.use(
        http.get("http://localhost/api/trpc/agents.getOne", async () => {
          return HttpResponse.json([{ result: { data: mockAgent } }]);
        }),
      );

      server.use(
        http.post("http://localhost/api/trpc/agents.remove", async () => {
          return HttpResponse.json([{ result: { data: mockAgent } }]);
        }),
      );
    });

    it("헤더 - 드롭다운 - 삭제 버튼을 클릭하면 ConfirmationDialog가 렌더링되어야 한다.", async () => {
      const { user } = render(
        <Suspense>
          <AgentIdView agentId="agent-1" />
        </Suspense>,
      );

      const deleteButton = await screen.findByRole("button", { name: "삭제" });
      await user.click(deleteButton);

      expect(await screen.findByRole("dialog")).toBeInTheDocument();
    });

    it("ConfirmationDialog에서 확인 버튼 클릭 시 에이전트가 삭제되고, /agents로 이동해야 한다.", async () => {
      const { user } = render(
        <Suspense>
          <AgentIdView agentId="agent-1" />
        </Suspense>,
      );

      const deleteButton = await screen.findByRole("button", { name: "삭제" });
      await user.click(deleteButton);

      const confirmButton = await screen.findByRole("button", { name: "확인" });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(routerFn).toHaveBeenCalledWith("/agents");
      });
    });

    it("에이전트가 성공적으로 삭제된 후, agents.getMany, premium.getFreeUsage 쿼리가 무효화되어야 한다.", async () => {
      const { user, queryClient } = render(
        <Suspense>
          <AgentIdView agentId="agent-1" />
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

    it("에이전트 삭제 실패 시, 에러 메시지를 토스트로 보여준다.", async () => {
      server.use(
        http.post("http://localhost/api/trpc/agents.remove", () => {
          return HttpResponse.json(
            [
              {
                error: {
                  message: "에이전트 삭제 실패",
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
          <AgentIdView agentId="agent-1" />
        </Suspense>,
      );

      const deleteButton = await screen.findByRole("button", { name: "삭제" });
      await user.click(deleteButton);

      const confirmButton = await screen.findByRole("button", { name: "확인" });
      await user.click(confirmButton);

      const { toast } = await import("sonner");
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("에이전트 삭제 실패", { position: "top-center" });
      });
    });
  });
});
