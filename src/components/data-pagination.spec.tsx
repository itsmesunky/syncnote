import { render, screen } from "@/lib/test/render";

import { DataPagination } from "./data-pagination";

describe("DataPagination 컴포넌트", () => {
  const defaultProps = {
    page: 1,
    totalPages: 1,
    onPageChange: () => {},
  };

  it("전달한 page와 totalPages가 올바르게 렌더링되어야 한다.", () => {
    render(<DataPagination {...defaultProps} />);
    expect(screen.getByText(`${defaultProps.page} 페이지 중 ${defaultProps.totalPages} 페이지`));
  });

  it("현재 페이지가 1 페이지라면 이전 버튼이 비활성화되어야 한다.", () => {
    render(<DataPagination {...defaultProps} />);

    const prevButton = screen.getByRole("button", { name: "이전" });
    expect(prevButton).toBeDisabled();
  });

  it("현재 페이지가 마지막 페이지라면 다음 버튼이 비활성화되어야 한다.", () => {
    render(<DataPagination {...defaultProps} />);

    const nextButton = screen.getByRole("button", { name: "다음" });
    expect(nextButton).toBeDisabled();
  });

  it("이전 버튼을 클릭했을 때, 페이지가 1 감소되어야 한다.", async () => {
    const mockOnPageChange = vi.fn();

    const mockProps = {
      page: 2,
      totalPages: 3,
      onPageChange: mockOnPageChange,
    };

    const { user } = render(<DataPagination {...mockProps} />);
    const prevButton = screen.getByRole("button", { name: "이전" });
    await user.click(prevButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  it("다음 버튼을 클릭했을 때, 페이지가 1 증가되어야 한다.", async () => {
    const mockOnPageChange = vi.fn();

    const mockProps = {
      page: 2,
      totalPages: 3,
      onPageChange: mockOnPageChange,
    };

    const { user } = render(<DataPagination {...mockProps} />);
    const nextButton = screen.getByRole("button", { name: "다음" });
    await user.click(nextButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });
});
