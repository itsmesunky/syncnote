import { HttpResponse, http } from "msw";

import { render, screen, waitFor } from "@/lib/test/render";
import { server } from "@/lib/test/vitest.setup";

import { MeetingForm } from "./meeting-form";

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

const mockAgents = [
  { id: "agent-1", name: "에이전트 1", userId: "user-1", instructions: "..." },
  { id: "agent-2", name: "에이전트 2", userId: "user-1", instructions: "..." },
];

const pushFn = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushFn }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), info: vi.fn() },
}));

vi.mock("@/components/command-select", () => ({
  CommandSelect: ({ onSelect, options, value, placeholder }: any) => (
    <button type="button" aria-label="dialog-open-button">
      <select value={value ?? ""} onChange={(e) => onSelect(e.target.value)}>
        <option value="">{placeholder}</option>
        {value && !options.find((o: any) => o.value === value) && (
          <option value={value}>{value}</option>
        )}
        {options.map((opt: any) => (
          <option key={opt.id} value={opt.value}>
            {opt.id}
          </option>
        ))}
      </select>
    </button>
  ),
}));

describe("MeetingForm 컴포넌트", () => {
  describe("등록 플로우", () => {
    beforeEach(() => {
      server.use(
        http.get("http://localhost/api/trpc/agents.getMany", async () => {
          return HttpResponse.json([{ result: { data: { items: mockAgents } } }]);
        }),
      );

      server.use(
        http.post("http://localhost/api/trpc/meetings.create", async () => {
          return HttpResponse.json([{ result: { data: mockMeeting } }]);
        }),
      );
    });

    it("면접명과 에이전트를 선택하고 등록 버튼을 클릭하면 면접 생성 요청이 전송되어야 한다.", async () => {
      const mockOnSuccess = vi.fn();
      const { user } = render(<MeetingForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText("면접명"), "테스트 면접");
      await user.click(screen.getByLabelText("dialog-open-button"));

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "agent-1");

      await user.click(screen.getByRole("button", { name: "등록" }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("등록 성공 시 onSuccess에 생성된 면접 id가 전달되어야 한다.", async () => {
      const mockOnSuccess = vi.fn();
      const { user } = render(<MeetingForm onSuccess={mockOnSuccess} />);

      await user.type(screen.getByLabelText("면접명"), "테스트 면접");
      await user.click(screen.getByLabelText("dialog-open-button"));

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "agent-1");

      await user.click(screen.getByRole("button", { name: "등록" }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith("meeting-1");
      });
    });

    it("등록 실패 시 에러 메시지를 토스트로 보여준다.", async () => {
      server.use(
        http.post("http://localhost/api/trpc/meetings.create", () =>
          HttpResponse.json(
            [{ error: { message: "면접 등록 실패", code: -32600, data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500 } } }],
            { status: 500 },
          ),
        ),
      );

      const { user } = render(<MeetingForm />);

      await user.type(screen.getByLabelText("면접명"), "테스트 면접");
      await user.click(screen.getByLabelText("dialog-open-button"));
      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "agent-1");
      await user.click(screen.getByRole("button", { name: "등록" }));

      const { toast } = await import("sonner");
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("면접 등록 실패", { position: "top-center" });
      });
    });

    it("프리미엄 한도 초과 시 /upgrade 페이지로 이동해야 한다.", async () => {
      server.use(
        http.post("http://localhost/api/trpc/meetings.create", () =>
          HttpResponse.json(
            [{ error: { message: "무료 면접 한도에 도달했습니다.", code: -32600, data: { code: "FORBIDDEN", httpStatus: 403 } } }],
            { status: 403 },
          ),
        ),
      );

      const { user } = render(<MeetingForm />);

      await user.type(screen.getByLabelText("면접명"), "테스트 면접");
      await user.click(screen.getByLabelText("dialog-open-button"));
      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "agent-1");
      await user.click(screen.getByRole("button", { name: "등록" }));

      await waitFor(() => {
        expect(pushFn).toHaveBeenCalledWith("/upgrade");
      });
    });

    it("등록 성공 시 meetings.getMany와 premium.getFreeUsage 쿼리가 무효화되어야 한다.", async () => {
      const { user, queryClient } = render(<MeetingForm />);
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      await user.type(screen.getByLabelText("면접명"), "테스트 면접");
      await user.click(screen.getByLabelText("dialog-open-button"));

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "agent-1");

      await user.click(screen.getByRole("button", { name: "등록" }));

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("수정 플로우", () => {
    beforeEach(() => {
      server.use(
        http.get("http://localhost/api/trpc/agents.getMany", async () => {
          return HttpResponse.json([{ result: { data: { items: mockAgents } } }]);
        }),
      );
    });

    it("initialValues가 있으면 수정 버튼이 렌더링되고 기존 값이 폼에 채워져야 한다.", () => {
      render(<MeetingForm initialValues={mockMeeting} />);

      expect(screen.getByRole("button", { name: "수정" })).toBeInTheDocument();
      expect(screen.getByLabelText("면접명")).toHaveValue("meeting1");
      expect(screen.getByRole("combobox")).toHaveValue("agent-1");
    });

    it("값을 수정하고 수정 버튼을 클릭하면 면접 수정 요청이 전송되어야 한다.", async () => {
      server.use(
        http.post("http://localhost/api/trpc/meetings.update", async () => {
          return HttpResponse.json([{ result: { data: mockMeeting } }]);
        }),
      );

      const mockOnSuccess = vi.fn();
      const { user } = render(
        <MeetingForm initialValues={mockMeeting} onSuccess={mockOnSuccess} />,
      );

      await user.clear(screen.getByLabelText("면접명"));
      await user.type(screen.getByLabelText("면접명"), "수정된 면접");
      await user.click(screen.getByLabelText("dialog-open-button"));

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "agent-2");

      await user.click(screen.getByRole("button", { name: "수정" }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("수정 실패 시 에러 메시지를 토스트로 보여준다.", async () => {
      server.use(
        http.post("http://localhost/api/trpc/meetings.update", () =>
          HttpResponse.json(
            [{ error: { message: "면접 수정 실패", code: -32600, data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500 } } }],
            { status: 500 },
          ),
        ),
      );

      const { user } = render(<MeetingForm initialValues={mockMeeting} />);

      await user.clear(screen.getByLabelText("면접명"));
      await user.type(screen.getByLabelText("면접명"), "수정된 면접");
      await user.click(screen.getByLabelText("dialog-open-button"));
      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "agent-2");
      await user.click(screen.getByRole("button", { name: "수정" }));

      const { toast } = await import("sonner");
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("면접 수정 실패", { position: "top-center" });
      });
    });

    it("수정 성공 시 meetings.getMany와 meetings.getOne 쿼리가 무효화되어야 한다.", async () => {
      server.use(
        http.post("http://localhost/api/trpc/meetings.update", async () => {
          return HttpResponse.json([{ result: { data: mockMeeting } }]);
        }),
      );

      const { user, queryClient } = render(<MeetingForm initialValues={mockMeeting} />);
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      await user.clear(screen.getByLabelText("면접명"));
      await user.type(screen.getByLabelText("면접명"), "수정된 면접");
      await user.click(screen.getByLabelText("dialog-open-button"));

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "agent-2");

      await user.click(screen.getByRole("button", { name: "수정" }));

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledTimes(2);
      });
    });
  });
});
