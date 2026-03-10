import { cn, formatDuration } from "./utils";

describe("cn 유틸 함수", () => {
  it("clsx가 조건부 클래스 값을 올바르게 병합한다.", () => {
    const isError = true;
    const isSuccess = false;

    expect(cn("text-base", isError && "text-red-500", isSuccess && "text-green-500")).toBe(
      "text-base text-red-500",
    );
  });

  it("twMerge가 Tailwind CSS 클래스 충돌 시 뒤에 오는 클래스로 덮어씌운다.", () => {
    expect(cn("p-4", "px-2")).toBe("p-4 px-2");
    expect(cn("bg-black-400", "bg-red-500")).toBe("bg-red-500");
  });
});

describe("formatDuration 유틸 함수", () => {
  it("60초 미만일 경우 초 단위 문자열을 반환한다.", () => {
    expect(formatDuration(3)).toBe("3초");
  });

  it("60초 이상일 경우 largest: 1 옵션에 의해 가장 큰 단위만 반환한다.", () => {
    expect(formatDuration(650)).toBe("11분");
  });
});
