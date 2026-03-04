import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

export const useGetAgents = (search: string) => {
  const trpc = useTRPC();
  return useQuery(trpc.agents.getMany.queryOptions({ pageSize: 100, search }));
};
