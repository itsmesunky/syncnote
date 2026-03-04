import { EmptyState } from "@/components/empty-state";

export const ProcessingState = () => {
  return (
    <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
      <EmptyState
        image="/processing.svg"
        title="면접 결과를 분석하고 있어요"
        description={
          "에이전트와의 대화 내용을 바탕으로 맞춤형 피드백과 요약본을 생성하고 있습니다. \n 잠시만 기다려 주세요."
        }
      />
    </div>
  );
};
