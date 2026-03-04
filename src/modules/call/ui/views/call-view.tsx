"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { FallbackState } from "@/components/fallback-state";
import { useTRPC } from "@/trpc/client";

import { CallProvider } from "../components/call-provider";

export const CallView = ({ meetingId }: { meetingId: string }) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }));

  if (data.status !== "upcoming") {
    return (
      <div className="flex h-screen items-center justify-center">
        <FallbackState
          type="error"
          title="면접이 종료되었어요"
          description="더 이상 이 면접에 참여하실 수 없습니다."
        />
      </div>
    );
  }

  return <CallProvider meetingId={meetingId} meetingName={data.name} />;
};
