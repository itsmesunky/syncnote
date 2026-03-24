import { authClient } from "@/lib/auth-client";
import { render, screen } from "@/lib/test/render";

import { SocialLoginButton } from "./social-login-button";

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      social: vi.fn(),
    },
  },
}));

describe("SocialLoginButton 컴포넌트", () => {
  const mockProps = {
    provider: "google",
    buttonText: "구글로 로그인하기",
    icon: <svg data-testid="google-icon" />,
  } as const;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("전달된 buttonText와 icon이 올바르게 렌더링되어야 한다.", () => {
    render(<SocialLoginButton {...mockProps} />);

    expect(screen.getByRole("button", { name: "구글로 로그인하기" })).toBeInTheDocument();
    expect(screen.getByTestId("google-icon")).toBeInTheDocument();
  });

  it("버튼을 클릭하면 올바른 provider와 함께 authClient.signIn.social이 호출되어야 한다.", async () => {
    const { user } = render(<SocialLoginButton {...mockProps} />);

    const socialLoginButton = screen.getByRole("button", { name: "구글로 로그인하기" });
    await user.click(socialLoginButton);

    expect(authClient.signIn.social).toHaveBeenCalledWith(
      {
        provider: mockProps.provider,
        callbackURL: "/",
      },
      expect.any(Object),
    );
  });
});
