import { Suspense } from "react";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { SearchParams } from "nuqs/server";
import { ErrorBoundary } from "react-error-boundary";

import { FallbackState } from "@/components/fallback-state";
import { auth } from "@/lib/auth";
import { loadSearchParams } from "@/modules/meetings/params";
import { MeetingsListHeader } from "@/modules/meetings/ui/components/meetings-list-header";
import { MeetingsView } from "@/modules/meetings/ui/views/meetings-view";
import { getQueryClient, trpc } from "@/trpc/server";

interface Props {
  searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  const filters = await loadSearchParams(searchParams);
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.meetings.getMany.queryOptions({ ...filters }));

  return (
    <>
      <MeetingsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <FallbackState
              type="loading"
              title="생성한 면접을 불러오고 있어요."
              description="데이터를 불러오는 데 몇 초 정도 소요될 수 있습니다."
            />
          }
        >
          <ErrorBoundary
            fallback={
              <FallbackState
                type="error"
                title="생성한 면접을 불러오는 데 실패했어요."
                description={"일시적인 오류가 발생했습니다. \n 잠시 후 다시 시도해 주세요."}
              />
            }
          >
            <MeetingsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default Page;
