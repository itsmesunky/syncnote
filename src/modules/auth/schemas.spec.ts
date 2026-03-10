import { signUpSchema } from "./schemas";

describe("signUpSchema 단위 테스트", () => {
  it("비밀번호와 비밀번호 확인이 다르면 에러를 반환해야 한다.", () => {
    const result = signUpSchema.safeParse({
      name: "test",
      email: "test@test.com",
      password: "test1234!",
      confirmPassword: "test123!",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      expect(errorMessage).toBe("비밀번호가 일치하지 않습니다.");
    }
  });
});
