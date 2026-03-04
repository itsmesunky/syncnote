import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

export const useGetMeetingInfo = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id }));
};
