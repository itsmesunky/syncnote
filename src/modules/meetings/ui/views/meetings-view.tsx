"use client";

import { useRouter } from "next/navigation";

import { useSuspenseQuery } from "@tanstack/react-query";

import { DataPagination } from "@/components/data-pagination";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { useDebounce } from "@/hooks/use-debounce";
import { useTRPC } from "@/trpc/client";

import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { columns } from "../components/columns";

export const MeetingsView = () => {
  const trpc = useTRPC();
  const router = useRouter();
  const [filters, setFilters] = useMeetingsFilters();
  const debouncedSearch = useDebounce(filters.search, 300);

  const { data } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions({
      ...filters,
      search: debouncedSearch,
    }),
  );

  const isAnyFilterModified = !!filters.search || !!filters.status || !!filters.agentId;
  const hasData = data.items.length > 0;

  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      <DataTable
        data={data.items}
        columns={columns}
        onRowClick={(row) => router.push(`/meetings/${row.id}`)}
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
          title="새로운 면접을 만들어 보세요."
          description={
            "에이전트를 선택하고 대화를 시작해 보세요. \n 사용자의 답변에 맞춰 실시간으로 반응하고 피드백을 제공합니다."
          }
        />
      )}
    </div>
  );
};
