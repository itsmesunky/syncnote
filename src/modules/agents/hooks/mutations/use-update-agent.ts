import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { UseMutationCallback } from "@/types";

export const useUpdateAgent = (callbacks?: UseMutationCallback) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.agents.update.mutationOptions({
      onSuccess: async ({ id }) => {
        await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
        await queryClient.invalidateQueries(trpc.agents.getOne.queryOptions({ id }));
        if (callbacks?.onSuccess) callbacks.onSuccess();
      },
      onError: (error) => {
        if (callbacks?.onError) callbacks.onError(error);
      },
    }),
  );
};
