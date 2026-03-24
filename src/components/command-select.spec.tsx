import { ReactNode } from "react";

import { render, screen } from "@/lib/test/render";

import { CommandSelect } from "./command-select";

vi.mock("@/components/ui/command", () => ({
  CommandResponsiveDialog: ({
    open,
    children,
    onOpenChange,
  }: {
    open: boolean;
    children: ReactNode;
    onOpenChange: (open: boolean) => void;
  }) =>
    open ? (
      <div>
        {children}
        <button aria-label="dialog-close-button" onClick={() => onOpenChange(false)} />
      </div>
    ) : null,
  CommandInput: ({ placeholder }: { placeholder: string }) => (
    <input placeholder={placeholder} />
  ),
  CommandList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CommandEmpty: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CommandItem: ({ children, onSelect }: { children: ReactNode; onSelect: () => void }) => (
    <div role="option" onClick={onSelect}>
      {children}
    </div>
  ),
}));

const mockOptions = [
  { id: "1", value: "option-1", children: <span>옵션 A</span> },
  { id: "2", value: "option-2", children: <span>옵션 B</span> },
];

describe("CommandSelect 컴포넌트", () => {
  it("버튼을 클릭했을 때 CommandResponsiveDialog가 열려야 한다.", async () => {
    const { user } = render(
      <CommandSelect options={mockOptions} value="" onSelect={vi.fn()} />,
    );

    await user.click(screen.getByLabelText("dialog-open-button"));
    expect(screen.queryByPlaceholderText("검색어를 입력해 주세요")).toBeInTheDocument();
  });

  it("옵션 클릭 시 onSelect가 해당 값과 함께 호출되고, CommandResponsiveDialog가 닫혀야 한다.", async () => {
    const mockOnSelect = vi.fn();
    const { user } = render(
      <CommandSelect options={mockOptions} value="" onSelect={mockOnSelect} />,
    );

    await user.click(screen.getByLabelText("dialog-open-button"));
    await user.click(screen.getAllByRole("option")[0]);

    expect(mockOnSelect).toHaveBeenCalledWith("option-1");
    expect(screen.queryByPlaceholderText("검색어를 입력해 주세요")).not.toBeInTheDocument();
  });

  it("value에 해당하는 옵션이 없으면 버튼에 placeholder가 표시되어야 한다.", () => {
    render(
      <CommandSelect
        options={mockOptions}
        value="없는값"
        onSelect={vi.fn()}
        placeholder="선택해 주세요"
      />,
    );

    expect(screen.getByText("선택해 주세요")).toBeInTheDocument();
  });

  it("value에 해당하는 옵션이 있으면 버튼에 해당 옵션의 children이 표시되어야 한다.", () => {
    render(<CommandSelect options={mockOptions} value="option-1" onSelect={vi.fn()} />);

    expect(screen.getByText("옵션 A")).toBeInTheDocument();
  });

  it("CommandResponsiveDialog가 닫힐 때 onSearch가 빈 문자열로 호출되어야 한다.", async () => {
    const mockOnSearch = vi.fn();
    const { user } = render(
      <CommandSelect options={mockOptions} value="" onSelect={vi.fn()} onSearch={mockOnSearch} />,
    );

    await user.click(screen.getByLabelText("dialog-open-button"));
    await user.click(screen.getByLabelText("dialog-close-button"));

    expect(mockOnSearch).toHaveBeenCalledWith("");
  });
});
