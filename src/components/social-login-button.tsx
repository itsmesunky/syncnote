import { ButtonHTMLAttributes, ReactNode } from "react";

import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onError"> {
  provider: "github" | "google";
  buttonText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  icon?: ReactNode;
  onSuccess?: () => void;
  onError?: (code: string) => void;
}

export const SocialLoginButton = ({
  provider,
  buttonText,
  variant = "outline",
  icon,
  onSuccess,
  onError,
  ...rest
}: Props) => {
  const onSocial = (provider: "github" | "google") => {
    authClient.signIn.social(
      {
        provider,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
        onError: ({ error }) => {
          onError?.(error.code);
        },
      },
    );
  };

  return (
    <Button type="button" variant={variant} onClick={() => onSocial(provider)} {...rest}>
      {icon}
      {buttonText}
    </Button>
  );
};
