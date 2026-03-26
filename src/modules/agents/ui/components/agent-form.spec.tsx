import { HttpResponse, http } from "msw";

import { render, screen, waitFor } from "@/lib/test/render";
import { server } from "@/lib/test/vitest.setup";

import { AgentForm } from "./agent-form";

const pushFn = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushFn }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), info: vi.fn() },
}));

const mockAgent = {
  id: "agent-1",
  name: "테스트 에이전트",
  instructions: "테스트 지침",
  userId: "user-1",
  createdAt: new Date().toString(),
  updatedAt: new Date().toString(),
  meetingCount: 0,
};

describe("AgentForm 컴포넌트", () => {
  describe("등록 플로우", () => {
    it("이름과 지침을 입력하고 등록 버튼을 클릭하면 에이전트 생성 요청이 전송되어야 한다.", async () => {
      server.use(
        http.post("http://localhost/api/trpc/agents.create", async () => {
          return HttpResponse.json([{ result: { data: mockAgent } }]);
        }),
      );

      const mockOnSuccess = vi.fn();
      const { user } = render(<AgentForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText("이름"), "테스트 에이전트");
      await user.type(screen.getByLabelText("역할 및 행동 지침"), "테스트 지침");
      await user.click(screen.getByRole("button", { name: "등록" }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("등록 성공 시 agents.getMany와 premium.getFreeUsage 쿼리가 무효화되어야 한다.", async () => {
      server.use(
        http.post("http://localhost/api/trpc/agents.create", async () => {
          return HttpResponse.json([{ result: { data: mockAgent } }]);
        }),
      );

      const { user, queryClient } = render(<AgentForm />);
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      await user.type(screen.getByLabelText("이름"), "테스트 에이전트");
      await user.type(screen.getByLabelText("역할 및 행동 지침"), "테스트 지침");
      await user.click(screen.getByRole("button", { name: "등록" }));

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledTimes(2);
      });
    });

    it("등록 실패 시 에러 메시지를 토스트로 보여준다.", async () => {
      server.use(
        http.post("http://localhost/api/trpc/agents.create", () =>
          HttpResponse.json(
            [{ error: { message: "에이전트 등록 실패", code: -32600, data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500 } } }],
            { status: 500 },
          ),
        ),
      );

      const { user } = render(<AgentForm />);

      await user.type(screen.getByLabelText("이름"), "테스트 에이전트");
      await user.type(screen.getByLabelText("역할 및 행동 지침"), "테스트 지침");
      await user.click(screen.getByRole("button", { name: "등록" }));

      const { toast } = await import("sonner");
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("에이전트 등록 실패", { position: "top-center" });
      });
    });

    it("프리미엄 한도 초과 시 /upgrade 페이지로 이동해야 한다.", async () => {
      server.use(
        http.post("http://localhost/api/trpc/agents.create", () =>
          HttpResponse.json(
            [{ error: { message: "무료 에이전트 한도에 도달했습니다.", code: -32600, data: { code: "FORBIDDEN", httpStatus: 403 } } }],
            { status: 403 },
          ),
        ),
      );

      const { user } = render(<AgentForm />);

      await user.type(screen.getByLabelText("이름"), "테스트 에이전트");
      await user.type(screen.getByLabelText("역할 및 행동 지침"), "테스트 지침");
      await user.click(screen.getByRole("button", { name: "등록" }));

      await waitFor(() => {
        expect(pushFn).toHaveBeenCalledWith("/upgrade");
      });
    });
  });

  describe("수정 플로우", () => {
    it("initialValues가 있으면 수정 버튼이 렌더링되고 기존 값이 폼에 채워져야 한다.", () => {
      render(<AgentForm initialValues={mockAgent} />);

      expect(screen.getByRole("button", { name: "수정" })).toBeInTheDocument();
      expect(screen.getByLabelText("이름")).toHaveValue(mockAgent.name);
      expect(screen.getByLabelText("역할 및 행동 지침")).toHaveValue(mockAgent.instructions);
    });

    it("값을 수정하고 수정 버튼을 클릭하면 에이전트 수정 요청이 전송되어야 한다.", async () => {
      server.use(
        http.post("http://localhost/api/trpc/agents.update", async () => {
          return HttpResponse.json([
            { result: { data: { ...mockAgent, name: "수정된 에이전트" } } },
          ]);
        }),
      );

      const mockOnSuccess = vi.fn();
      const { user } = render(<AgentForm initialValues={mockAgent} onSuccess={mockOnSuccess} />);

      await user.clear(screen.getByLabelText("이름"));
      await user.type(screen.getByLabelText("이름"), "수정된 에이전트");
      await user.click(screen.getByRole("button", { name: "수정" }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("수정 성공 시 agents.getMany와 agents.getOne 쿼리가 무효화되어야 한다.", async () => {
      server.use(
        http.post("http://localhost/api/trpc/agents.update", async () => {
          return HttpResponse.json([
            { result: { data: { ...mockAgent, name: "수정된 에이전트" } } },
          ]);
        }),
      );

      const { user, queryClient } = render(<AgentForm initialValues={mockAgent} />);
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      await user.clear(screen.getByLabelText("이름"));
      await user.type(screen.getByLabelText("이름"), "수정된 에이전트");
      await user.click(screen.getByRole("button", { name: "수정" }));

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledTimes(2);
      });
    });

    it("수정 실패 시 에러 메시지를 토스트로 보여준다.", async () => {
      server.use(
        http.post("http://localhost/api/trpc/agents.update", () =>
          HttpResponse.json(
            [{ error: { message: "에이전트 수정 실패", code: -32600, data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500 } } }],
            { status: 500 },
          ),
        ),
      );

      const { user } = render(<AgentForm initialValues={mockAgent} />);

      await user.clear(screen.getByLabelText("이름"));
      await user.type(screen.getByLabelText("이름"), "수정된 에이전트");
      await user.click(screen.getByRole("button", { name: "수정" }));

      const { toast } = await import("sonner");
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("에이전트 수정 실패", { position: "top-center" });
      });
    });
  });
});
