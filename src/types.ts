import { TRPCClientErrorLike } from "@trpc/client";

import { AppRouter } from "./trpc/routers/_app";

export type UseMutationCallback = {
  onSuccess?: (value?: string) => void;
  onError?: (error: TRPCClientErrorLike<AppRouter>) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};

export type AvatarBase = {
  seed: string;
  variant: "botttsNeutral" | "initials";
};
