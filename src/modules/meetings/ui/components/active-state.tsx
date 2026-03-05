import { EmptyState } from "@/components/empty-state";

export const ActiveState = () => {
  return (
    <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
      <EmptyState
        image="/upcoming.svg"
        title="면접이 진행 중입니다."
        description="참가자가 퇴장하면 면접이 종료됩니다."
      />
    </div>
  );
};
