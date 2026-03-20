import userEvent from "@testing-library/user-event";

import { render, screen } from "@/lib/test/render";

import { useConfirm } from "./use-confirm";

const TestComponent = () => {
  const [ConfirmationDialog, confirm] = useConfirm("삭제 확인", "정말 삭제하시겠습니까?");

  const handleRemove = async () => {
    await confirm();
  };

  return (
    <>
      <ConfirmationDialog />
      <button onClick={handleRemove}>삭제</button>
    </>
  );
};

describe("useConfirm 단위 테스트", () => {
  beforeEach(() => {
    render(<TestComponent />);
  });

  it("초기에 다이얼로그가 렌더링되지 않아야 한다.", () => {
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("confirm()을 호출하면 다이얼로그가 열려야 한다.", () => {
    const button = screen.getByRole("button", { name: "삭제" });
    userEvent.click(button);
    expect(screen.queryByRole("dialog")).toBeInTheDocument();
  });
});
