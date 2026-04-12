import { useState } from "react";

import { act, fireEvent, render, screen } from "@/lib/test/render";

import { useDebounce } from "./use-debounce";

const TestComponent = () => {
  const [text, setText] = useState("");
  const debouncedText = useDebounce(text, 300);

  return (
    <div>
      <h1>{debouncedText}</h1>
      <input type="text" value={text} onChange={(e) => setText(e.target.value)} />
    </div>
  );
};

describe("useDebounce 단위 테스트", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    render(<TestComponent />);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("매개변수로 전달한 value가 delay가 지난 뒤에 업데이트 된다.", () => {
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "테스트" } });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("테스트");
  });

  it("delay 내 연속 입력 시 마지막 값만 반영된다.", () => {
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "테" } });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    fireEvent.change(input, { target: { value: "가나다" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("가나다");
  });
});
