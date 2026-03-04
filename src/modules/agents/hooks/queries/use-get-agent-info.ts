import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

export const useGetAgentInfo = (agentId: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.agents.getOne.queryOptions({ id: agentId }));
};
