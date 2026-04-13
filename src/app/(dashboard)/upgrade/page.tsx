import { Suspense } from "react";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { FallbackState } from "@/components/fallback-state";
import { auth } from "@/lib/auth";
import { UpgradeView } from "@/modules/premium/ui/views/upgrade-view";
import { getQueryClient, trpc } from "@/trpc/server";

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const queryClient = getQueryClient();
  void Promise.all([
    queryClient.prefetchQuery(trpc.premium.getCurrentSubscription.queryOptions()),
    queryClient.prefetchQuery(trpc.premium.getProducts.queryOptions()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <FallbackState
            type="loading"
            title="요금제를 불러오고 있어요"
            description="데이터를 불러오는 데 몇 초 정도 소요될 수 있습니다."
          />
        }
      >
        <ErrorBoundary
          fallback={
            <FallbackState
              type="error"
              title="요금제를 불러오는 데 실패했어요"
              description={"일시적인 오류가 발생했습니다. \n 잠시 후 다시 시도해 주세요."}
            />
          }
        >
          <UpgradeView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
