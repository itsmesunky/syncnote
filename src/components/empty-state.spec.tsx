import { render, screen } from "@/lib/test/render";

import { EmptyState } from "./empty-state";

describe("empty-state 컴포넌트", () => {
  const defaultProps = {
    title: "데이터 없음",
    description: "데이터가 존재하지 않습니다.",
  };

  it("전달된 제목(title)과 설명(description), 기본 이미지가 올바르게 표시되어야 한다.", () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.getByRole("heading", { level: 6, name: defaultProps.title })).toBeInTheDocument();
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument();
    expect(screen.getByAltText("Empty")).toBeInTheDocument();
  });

  it("커스텀 이미지를 넘기면 해당 이미지 경로가 적용되어야 한다.", () => {
    const customImage = "/custom-empty.svg";
    render(<EmptyState {...defaultProps} image={customImage} />);
    expect(screen.getByAltText("Empty")).toHaveAttribute("src", customImage);
  });
});
