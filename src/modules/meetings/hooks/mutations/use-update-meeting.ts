import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { UseMutationCallback } from "@/types";

export const useUpdateMeeting = (callback?: UseMutationCallback) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.meetings.update.mutationOptions({
      onSuccess: async ({ id }) => {
        await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
        await queryClient.invalidateQueries(trpc.meetings.getOne.queryOptions({ id }));
        if (callback?.onSuccess) callback.onSuccess();
      },
      onError: (error) => {
        if (callback?.onError) callback.onError(error);
      },
    }),
  );
};
