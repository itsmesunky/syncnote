"use client";

import { useState } from "react";

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
import { signInSchema } from "../../schemas";

export const SignInView = () => {
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { control, handleSubmit } = methods;

  const onSubmit = (data: z.infer<typeof signInSchema>) => {
    setPending(true);
    setError(null);

    authClient.signIn.email(
      {
        ...data,
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
              <form onSubmit={handleSubmit(onSubmit)}>
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
                {!!error && (
                  <Alert className="bg-destructive/10 border-none">
                    <OctagonAlertIcon className="h-4 w-4 text-destructive!" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={pending}>
                  로그인
                </Button>
              </form>
            </Form>
            <div>
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
          </div>
          <div className="relative hidden md:flex flex-col gap-y-4 items-center justify-center">
            TODO: 로고 삽입
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
