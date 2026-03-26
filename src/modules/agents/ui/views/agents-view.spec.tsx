import { Suspense } from "react";

import { HttpResponse, http } from "msw";

import { render, screen } from "@/lib/test/render";
import { server } from "@/lib/test/vitest.setup";

import { AgentsGetMany } from "../../types";
import { AgentsView } from "./agents-view";

const mockAgents: AgentsGetMany = [];
for (let i = 1; i <= 5; i++) {
  mockAgents.push({
    id: `agent-${i}`,
    name: `테스트 에이전트 ${i}`,
    instructions: `테스트 지침 ${i}`,
    userId: `user-${i}`,
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
    meetingCount: 0,
  });
}

const pushFn = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushFn }),
}));

describe("AgentsView 컴포넌트", () => {
  describe("데이터가 존재하지 않는 경우", () => {
    beforeEach(() => {
      server.use(
        http.get("http://localhost/api/trpc/agents.getMany", () => {
          return HttpResponse.json([{ result: { data: { items: [], totalPages: 0 } } }]);
        }),
      );
    });

    it("EmptyState 컴포넌트가 렌더링 되어야한다.", async () => {
      render(
        <Suspense>
          <AgentsView />
        </Suspense>,
      );

      expect(
        await screen.findByRole("heading", { name: /새로운 에이전트를/i }),
      ).toBeInTheDocument();
    });

    it("페이지네이션이 보이지 않아야한다.", async () => {
      render(
        <Suspense>
          <AgentsView />
        </Suspense>,
      );

      await screen.findByRole("heading", { name: /새로운 에이전트를/i });
      expect(screen.queryByRole("button", { name: "이전" })).not.toBeInTheDocument();
    });
  });

  describe("데이터가 존재하는 경우", () => {
    beforeEach(() => {
      server.use(
        http.get("http://localhost/api/trpc/agents.getMany", () => {
          return HttpResponse.json([{ result: { data: { items: mockAgents, totalPages: 2 } } }]);
        }),
      );
    });

    it("에이전트 목록이 렌더링 되어야한다.", async () => {
      render(
        <Suspense>
          <AgentsView />
        </Suspense>,
      );

      expect(await screen.findByText("테스트 에이전트 1")).toBeInTheDocument();
      expect(screen.getByText("테스트 에이전트 5")).toBeInTheDocument();
    });

    it("페이지네이션이 보여야한다.", async () => {
      render(
        <Suspense>
          <AgentsView />
        </Suspense>,
      );

      expect(await screen.findByRole("button", { name: "이전" })).toBeInTheDocument();
    });

    it("에이전트 행 클릭 시 해당 에이전트 상세 페이지로 이동해야 한다.", async () => {
      const { user } = render(
        <Suspense>
          <AgentsView />
        </Suspense>,
      );

      const rows = await screen.findAllByRole("row");
      await user.click(rows[0]);

      expect(pushFn).toHaveBeenCalledWith("/agents/agent-1");
    });
  });
});
