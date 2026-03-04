"use client";

import { useRouter } from "next/navigation";

import { useSuspenseQuery } from "@tanstack/react-query";

import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { useTRPC } from "@/trpc/client";

import { DataPagination } from "../../../../components/data-pagination";
import { useAgentsFilters } from "../../hooks/use-agents-filters";
import { columns } from "../components/columns";

export const AgentsView = () => {
  const trpc = useTRPC();
  const router = useRouter();

  const [filters, setFilters] = useAgentsFilters();

  const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions({ ...filters }));

  const isAnyFilterModified = !!filters.search;
  const hasData = data.items.length > 0;

  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <DataTable
        data={data.items}
        columns={columns}
        onRowClick={(row) => router.push(`/agents/${row.id}`)}
      />

      {hasData && (
        <DataPagination
          page={filters.page}
          totalPages={data.totalPages}
          onPageChange={(page) => setFilters({ page })}
        />
      )}

      {!isAnyFilterModified && !hasData && (
        <EmptyState
          title="새로운 에이전트를 만들어 보세요."
          description={
            "모의 면접을 진행할 에이전트를 생성해 보세요. \n 설정하신 지침에 맞춰 사용자와 실시간으로 대화하고 피드백을 제공합니다."
          }
        />
      )}
    </div>
  );
};
