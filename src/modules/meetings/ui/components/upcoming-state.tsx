import Link from "next/link";

import { VideoIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

interface Props {
  meetingId: string;
}

export const UpcomingState = ({ meetingId }: Props) => {
  return (
    <div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
      <EmptyState
        image="/upcoming.svg"
        title="아직 면접을 시작하지 않았어요."
        description={
          "에이전트와 대화를 나누고 면접을 종료하면\n이곳에 상세한 분석 결과가 나타나요."
        }
      />
      <div className="flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2 w-full">
        <Button asChild className="w-full lg:w-auto">
          <Link href={`/call/${meetingId}`}>
            <VideoIcon />
            면접 시작하기
          </Link>
        </Button>
      </div>
    </div>
  );
};
