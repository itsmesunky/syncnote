import { render, screen } from "@/lib/test/render";

import { CompletedState } from "./completed-state";

vi.mock("./chat-provider", () => ({
  ChatProvider: () => <div>ChatProvider 모킹</div>,
}));

vi.mock("./transcript", () => ({
  Transcript: () => <div>Transcript 모킹</div>,
}));

const mockData = {
  id: "meeting-1",
  name: "모의 면접 1",
  status: "completed" as const,
  summary: "면접 결과 요약입니다.",
  duration: 3600,
  startedAt: new Date("2026-01-01T10:00:00").toString(),
  endedAt: new Date("2026-01-01T11:00:00").toString(),
  createdAt: new Date().toString(),
  updatedAt: new Date().toString(),
  userId: "user-1",
  agentId: "agent-1",
  transcriptUrl: "https://example.com/transcript",
  recordingUrl: "https://example.com/recording.mp4",
  agent: {
    id: "agent-1",
    name: "테스트 에이전트",
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
    userId: "user-1",
    instructions: "테스트 지침",
  },
};

describe("CompletedState 컴포넌트", () => {
  it("기본으로 요약 탭이 렌더링되어야 한다.", () => {
    render(<CompletedState data={mockData} />);

    expect(screen.getByText("면접 결과 요약입니다.")).toBeInTheDocument();
    expect(screen.getByText("모의 면접 1")).toBeInTheDocument();
  });

  it("에이전트 이름이 렌더링되어야 한다.", () => {
    render(<CompletedState data={mockData} />);

    expect(screen.getByText("테스트 에이전트")).toBeInTheDocument();
  });

  it("'대화 내용' 탭 클릭 시 Transcript 컴포넌트가 렌더링되어야 한다.", async () => {
    const { user } = render(<CompletedState data={mockData} />);

    await user.click(screen.getByRole("tab", { name: /대화 내용/ }));

    expect(screen.getByText("Transcript 모킹")).toBeInTheDocument();
  });

  it("'Ask AI' 탭 클릭 시 ChatProvider 컴포넌트가 렌더링되어야 한다.", async () => {
    const { user } = render(<CompletedState data={mockData} />);

    await user.click(screen.getByRole("tab", { name: /Ask AI/ }));

    expect(await screen.findByText("ChatProvider 모킹")).toBeInTheDocument();
  });

  it("'녹화본' 탭 클릭 시 비디오가 렌더링되어야 한다.", async () => {
    const { user } = render(<CompletedState data={mockData} />);

    await user.click(screen.getByRole("tab", { name: /녹화본/ }));

    expect(document.querySelector("video")).toBeInTheDocument();
  });
});
