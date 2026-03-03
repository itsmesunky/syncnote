"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

import { CallProvider } from "../components/call-provider";

export const CallView = ({ meetingId }: { meetingId: string }) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }));

  if (data.status === "completed") {
    return (
      <div className="flex h-screen items-center justify-center">TODO: 에러 메시지 렌더링</div>
    );
  }

  return <CallProvider meetingId={meetingId} meetingName={data.name} />;
};
