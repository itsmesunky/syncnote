"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { OctagonAlertIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";

import { FormInput } from "@/components/form-input";
import { SocialLoginButton } from "@/components/social-login-button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";

import { errorMap, socialLoginMap } from "../../constants";
import { signUpSchema } from "../../schemas";

export const SignUpView = () => {
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { control, handleSubmit } = methods;

  const onSubmit = ({ name, email, password }: z.infer<typeof signUpSchema>) => {
    setPending(true);
    setError(null);

    authClient.signUp.email(
      {
        name,
        email,
        password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setPending(false);
          router.replace("/");
        },
        onError: ({ error }) => {
          setPending(false);
          setError(errorMap[error.code]);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div>
            <Form {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="grid gap-3">
                    <FormInput
                      type="text"
                      fieldName="name"
                      control={control}
                      label="이름"
                      placeholder="이름을 입력해 주세요."
                    />
                  </div>
                  <div className="grid gap-3">
                    <FormInput
                      type="email"
                      fieldName="email"
                      control={control}
                      label="이메일"
                      placeholder="이메일을 입력해 주세요."
                    />
                  </div>
                  <div className="grid gap-3">
                    <FormInput
                      type="password"
                      fieldName="password"
                      control={control}
                      label="비밀번호"
                      placeholder="비밀번호를 입력해 주세요."
                    />
                  </div>
                  <div className="grid gap-3">
                    <FormInput
                      type="password"
                      fieldName="confirmPassword"
                      control={control}
                      label="비밀번호 확인"
                      placeholder="비밀번호를 다시 한 번 입력해 주세요."
                    />
                  </div>
                  {!!error && (
                    <Alert className="bg-destructive/10 border-none">
                      <OctagonAlertIcon className="h-4 w-4 text-destructive!" />
                      <AlertTitle>{error}</AlertTitle>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={pending}>
                    회원가입
                  </Button>
                  <div className="grid grid-cols-2 gap-4">
                    {socialLoginMap.map(({ provider, icon: Icon }) => (
                      <SocialLoginButton
                        key={provider}
                        provider={provider}
                        icon={<Icon />}
                        onSuccess={() => {
                          setPending(false);
                          setError(null);
                          router.replace("/");
                        }}
                        onError={(code) => {
                          setPending(false);
                          setError(errorMap[code]);
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-center text-sm">
                    이미 계정이 있으신가요?{" "}
                    <Link href="/sign-in" className="underline underline-offset-4">
                      로그인
                    </Link>
                  </div>
                </div>
              </form>
            </Form>
          </div>
          <div className="relative hidden md:flex flex-col gap-y-4 items-center justify-center">
            <img src="/logo.svg" alt="Image" className="h-[92px] w-[92px]" />
            <p className="text-2xl font-semibold text-white">SYNCNOTE</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
