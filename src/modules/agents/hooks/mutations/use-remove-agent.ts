import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { UseMutationCallback } from "@/types";

export const useRemoveAgent = (callbacks?: UseMutationCallback) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.agents.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
        await queryClient.invalidateQueries(trpc.premium.getFreeUsage.queryOptions());
        if (callbacks?.onSuccess) callbacks.onSuccess();
      },
      onError: (error) => {
        if (callbacks?.onError) callbacks.onError(error);
      },
    }),
  );
};
