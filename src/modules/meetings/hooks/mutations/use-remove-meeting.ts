import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { UseMutationCallback } from "@/types";

export const useRemoveMeeting = (callbacks?: UseMutationCallback) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.meetings.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
        // TODO: 결제 기능 추가 시, 사용 한도 변경
        if (callbacks?.onSuccess) callbacks.onSuccess();
      },
      onError: (error) => {
        if (callbacks?.onError) callbacks.onError(error);
      },
    }),
  );
};
