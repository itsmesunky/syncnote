import { Suspense } from "react";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { FallbackState } from "@/components/fallback-state";
import { auth } from "@/lib/auth";
import { MeetingIdView } from "@/modules/meetings/ui/views/meeting-id-view";
import { getQueryClient, trpc } from "@/trpc/server";

interface Props {
  params: Promise<{ meetingId: string }>;
}

const Page = async ({ params }: Props) => {
  const { meetingId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <FallbackState
            type="loading"
            title="생성한 면접 정보를 불러오고 있어요"
            description="데이터를 불러오는 데 몇 초 정도 소요될 수 있습니다."
          />
        }
      >
        <ErrorBoundary
          fallback={
            <FallbackState
              type="error"
              title="생성한 면접 정보를 불러오는 데 실패했어요."
              description={"일시적인 오류가 발생했습니다. \n 새로고침 하여 다시 시도해 주세요."}
            />
          }
        >
          <MeetingIdView meetingId={meetingId} />;
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
