import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { UseMutationCallback } from "@/types";

export const useCreateMeeting = (callbacks?: UseMutationCallback) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.meetings.create.mutationOptions({
      onSuccess: async ({ id }) => {
        await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
        // TODO: 결제 기능 추가 시, 한도 적용
        if (callbacks?.onSuccess) callbacks.onSuccess(id);
      },
      onError: (error) => {
        // TODO: 결제 기능 추가 시, 한도 적용
        if (callbacks?.onError) callbacks.onError(error);
      },
    }),
  );
};
