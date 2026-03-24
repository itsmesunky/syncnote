import { render, screen } from "@/lib/test/render";

import { FallbackState } from "./fallback-state";

describe("fallback-state 컴포넌트", () => {
  it("type이 'loading'일 때 로딩 아이콘이 렌더링되어야 한다.", () => {
    const loadingProps = {
      title: "로딩 중",
      description: "잠시만 기다려주세요.",
    };

    render(<FallbackState type="loading" {...loadingProps} />);
    expect(screen.getByRole("heading", { level: 6, name: loadingProps.title })).toBeInTheDocument();
    expect(screen.getByText(loadingProps.description)).toBeInTheDocument();
    expect(screen.getByLabelText("로딩 중 아이콘")).toBeInTheDocument();
    expect(screen.queryByLabelText("에러 아이콘")).not.toBeInTheDocument();
  });

  it("type이 'error'일 때 에러 아이콘이 렌더링되어야 한다.", () => {
    const errorProps = {
      title: "에러",
      description: "문제가 발생했습니다.",
    };

    render(<FallbackState type="error" {...errorProps} />);
    expect(screen.getByRole("heading", { level: 6, name: errorProps.title })).toBeInTheDocument();
    expect(screen.getByText(errorProps.description)).toBeInTheDocument();
    expect(screen.getByLabelText("에러 아이콘")).toBeInTheDocument();
    expect(screen.queryByLabelText("로딩 중 아이콘")).not.toBeInTheDocument();
  });
});
