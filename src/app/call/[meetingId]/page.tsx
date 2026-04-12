import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { auth } from "@/lib/auth";
import { CallView } from "@/modules/call/ui/views/call-view";
import { getQueryClient, trpc } from "@/trpc/server";

interface Props {
  params: Promise<{
    meetingId: string;
  }>;
}

const Page = async ({ params }: Props) => {
  const { meetingId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CallView meetingId={meetingId} />
    </HydrationBoundary>
  );
};

export default Page;
