import { botttsNeutral, initials } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

import { generateAvatarUri } from "./avatar";

vi.mock("@dicebear/core", () => ({
  createAvatar: vi.fn(() => ({
    toDataUri: () => "data:image/svg+xml;base64,dummy-data",
  })),
}));

describe("generateAvatarUri 유틸 함수", () => {
  const seed = "test";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("variant가 'botttsNeutral'일 때 올바른 인자로 createAvatar를 호출해야 한다.", () => {
    generateAvatarUri({ seed, variant: "botttsNeutral" });
    expect(createAvatar).toHaveBeenCalledWith(botttsNeutral, { seed });
  });

  it("variant가 'initials'일 때 폰트 크기와 두께 옵션을 포함하여 createAvatar를 호출해야 한다.", () => {
    generateAvatarUri({ seed, variant: "initials" });
    expect(createAvatar).toHaveBeenCalledWith(initials, { seed, fontWeight: 500, fontSize: 42 });
  });

  it("Data URI 형태의 올바른 문자열을 반환해야 한다.", () => {
    const result = generateAvatarUri({ seed, variant: "botttsNeutral" });
    expect(result).toBe("data:image/svg+xml;base64,dummy-data");
  });
});
