import Link from "next/link";

import { Button } from "@/components/ui/button";

export const CallEnded = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-radial from-sidebar-accent to-sidebar">
      <div className="py-4 px-8 flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
          <div className="flex flex-col gap-y-2 text-center">
            <h6 className="text-lg font-medium">수고하셨습니다. 모의 면접이 종료되었어요.</h6>
            <p className="text-sm">잠시 후 면접 결과 요약이 제공됩니다.</p>
          </div>
          <Button asChild>
            <Link href="/meetings">면접 목록으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
