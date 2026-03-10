import z from "zod";

export const signInSchema = z.object({
  email: z
    .email({ message: "올바른 이메일 형식을 입력해 주세요." })
    .min(1, { message: "이메일은 필수 입력 사항입니다." }),
  password: z.string().min(1, { message: "비밀번호는 필수 입력 사항입니다." }),
});

export const signUpSchema = z
  .object({
    name: z.string().min(1, { message: "이름은 필수 입력 사항입니다." }),
    email: z
      .email({ message: "올바른 이메일 형식을 입력해 주세요." })
      .min(1, { message: "이메일은 필수 입력 사항입니다." }),
    password: z.string().min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." }),
    confirmPassword: z.string().min(1, { message: "비밀번호 확인을 입력해 주세요." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });
