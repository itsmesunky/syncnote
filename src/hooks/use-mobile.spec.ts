import { act, renderHook } from "@testing-library/react";

import { useIsMobile } from "./use-mobile";

describe("useIsMobile 커스텀 훅", () => {
  let changeListener: () => void;

  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onChange: null,
        addEventListener: vi.fn((event, callback) => {
          if (event === "change") changeListener = callback;
        }),
        removeEventListener: vi.fn(),
      })),
    });
  });

  it("화면 크기가 768px 미만(모바일)일 때 true를 반환한다.", () => {
    window.innerWidth = 767;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("화면 크기가 768px 이상(데스크탑)일 때 false를 반환한다.", () => {
    window.innerWidth = 768;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("창 크기가 리사이징 되면 상태가 동적으로 업데이트되어야 한다.", () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      window.innerWidth = 767;
      changeListener();
    });

    expect(result.current).toBe(true);
  });
});
