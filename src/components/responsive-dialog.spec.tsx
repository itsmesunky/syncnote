import { ReactNode } from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { render, screen } from "@/lib/test/render";

import { ResponsiveDialog } from "./responsive-dialog";

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: vi.fn(() => false),
}));

vi.mock("./ui/drawer", () => ({
  Drawer: ({ children, open }: { children: ReactNode; open: boolean }) =>
    open ? <div data-testid="drawer-wrapper">{children}</div> : null,
  DrawerContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DrawerHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DrawerTitle: ({ children }: { children: string }) => <h1>{children}</h1>,
  DrawerDescription: ({ children }: { children: string }) => <p>{children}</p>,
}));

vi.mock("./ui/dialog", () => ({
  Dialog: ({ children, open }: { children: ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog-wrapper">{children}</div> : null,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: string }) => <h1>{children}</h1>,
  DialogDescription: ({ children }: { children: string }) => <p>{children}</p>,
}));

describe("ResponsiveDialog 컴포넌트", () => {
  const mockProps = {
    title: "테스트 제목",
    description: "테스트 설명",
    open: true,
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("모바일 환경일 때는 Drawer가 렌더링되어야 한다.", () => {
    vi.mocked(useIsMobile).mockReturnValue(true);

    render(
      <ResponsiveDialog {...mockProps}>
        <div>모바일 콘텐츠</div>
      </ResponsiveDialog>,
    );

    expect(screen.getByTestId("drawer-wrapper")).toBeInTheDocument();
    expect(screen.queryByTestId("dialog-wrapper")).not.toBeInTheDocument();

    expect(screen.getByRole("heading", { level: 1, name: mockProps.title })).toBeInTheDocument();
    expect(screen.getByText(mockProps.description)).toBeInTheDocument();
    expect(screen.getByText("모바일 콘텐츠")).toBeInTheDocument();
  });

  it("데스크탑 환경일 때는 Dialog가 렌더링되어야 한다.", () => {
    vi.mocked(useIsMobile).mockReturnValue(false);

    render(
      <ResponsiveDialog {...mockProps}>
        <div>데스크탑 콘텐츠</div>
      </ResponsiveDialog>,
    );

    expect(screen.getByTestId("dialog-wrapper")).toBeInTheDocument();
    expect(screen.queryByTestId("drawer-wrapper")).not.toBeInTheDocument();

    expect(screen.getByRole("heading", { level: 1, name: mockProps.title })).toBeInTheDocument();
    expect(screen.getByText(mockProps.description)).toBeInTheDocument();
    expect(screen.getByText("데스크탑 콘텐츠")).toBeInTheDocument();
  });
});
