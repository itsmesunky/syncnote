import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { SearchParams } from "nuqs";

import { auth } from "@/lib/auth";
import { loadSearchParams } from "@/modules/agents/params";
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

  return <></>;
};

export default Page;
