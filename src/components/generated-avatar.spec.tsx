import { generateAvatarUri } from "@/lib/avatar";
import { render, screen } from "@/lib/test/render";
import { AvatarBase } from "@/types";

import { GeneratedAvatar } from "./generated-avatar";

vi.mock("@/lib/avatar", () => ({
  generateAvatarUri: vi.fn(() => "mocked-avatar-uri"),
}));

describe("GeneratedAvatar 컴포넌트", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("이미지 로드 전에는 seed의 첫 글자를 대문자로 변환한 Fallback이 렌더링되어야 한다.", () => {
    const mockProps = {
      seed: "apple",
      variant: "initials",
    } as AvatarBase;

    render(<GeneratedAvatar {...mockProps} />);

    expect(generateAvatarUri).toHaveBeenCalledWith(mockProps);
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
