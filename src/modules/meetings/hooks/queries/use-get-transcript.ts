import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

export const useGetTranscript = (id: string) => {
  const trpc = useTRPC();
  return useQuery(trpc.meetings.getTranscript.queryOptions({ id }));
};
