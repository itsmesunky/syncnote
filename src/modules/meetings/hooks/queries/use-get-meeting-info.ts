import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

export const useGetMeetingInfo = (id: string) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery({
    ...trpc.meetings.getOne.queryOptions({ id }),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "processing" ? 5000 : false;
    },
  });

  return { data };
};
