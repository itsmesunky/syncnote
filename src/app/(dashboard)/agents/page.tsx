import { Suspense } from "react";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import type { SearchParams } from "nuqs";
import { ErrorBoundary } from "react-error-boundary";

import { FallbackState } from "@/components/fallback-state";
import { auth } from "@/lib/auth";
import { loadSearchParams } from "@/modules/agents/params";
import { AgentsListHeader } from "@/modules/agents/ui/components/agents-list-header";
import { AgentsView } from "@/modules/agents/ui/views/agents-view";
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
  void queryClient.prefetchQuery(
    trpc.agents.getMany.queryOptions({
      ...filters,
    }),
  );

  return (
    <>
      <AgentsListHeader />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <FallbackState
              type="loading"
              title="에이전트를 불러오고 있어요."
              description="데이터를 불러오는 데 몇 초 정도 소요될 수 있습니다."
            />
          }
        >
          <ErrorBoundary
            fallback={
              <FallbackState
                type="error"
                title="에이전트를 불러오지 못했어요. 😭"
                description="일시적인 오류가 발생했습니다."
              />
            }
          >
            <AgentsView />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </>
  );
};

export default Page;
