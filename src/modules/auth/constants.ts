import { FaGithub, FaGoogle } from "react-icons/fa";

export const socialLoginMap = [
  { provider: "google", icon: FaGoogle },
  { provider: "github", icon: FaGithub },
] as const;

export const errorMap: Record<string, string> = {
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "이미 가입된 이메일입니다.",
  INVALID_EMAIL_OR_PASSWORD: "이메일 또는 비밀번호가 올바르지 않습니다.",
};
