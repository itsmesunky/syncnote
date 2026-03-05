"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { FallbackState } from "@/components/fallback-state";
import { useTRPC } from "@/trpc/client";

import { CallProvider } from "../components/call-provider";

export const CallView = ({ meetingId }: { meetingId: string }) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }));

  switch (data.status) {
    case "active":
      return (
        <div className="flex h-screen items-center justify-center">
          <FallbackState
            type="error"
            title="면접이 진행 중입니다."
            description="이미 진행 중인 면접에는 참여하실 수 없습니다."
          />
        </div>
      );
    case "completed":
    case "processing":
      return (
        <div className="flex h-screen items-center justify-center">
          <FallbackState
            type="error"
            title="종료된 면접입니다."
            description="이 면접은 이미 종료되어 더 이상 참여하실 수 없습니다."
          />
        </div>
      );
  }

  return <CallProvider meetingId={meetingId} meetingName={data.name} />;
};
