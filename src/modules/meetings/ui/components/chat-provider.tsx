"use client";

import { FallbackState } from "@/components/fallback-state";
import { authClient } from "@/lib/auth-client";

import { ChatUI } from "./chat-ui";

interface Props {
  meetingId: string;
  meetingName: string;
}

export const ChatProvider = ({ meetingId, meetingName }: Props) => {
  const { data, isPending } = authClient.useSession();

  if (isPending || !data?.user) {
    return (
      <FallbackState
        type="loading"
        title="대화 내용을 불러오고 있어요."
        description="데이터를 불러오는 데 몇 초 정도 소요될 수 있습니다."
      />
    );
  }

  return (
    <ChatUI
      meetingId={meetingId}
      meetingName={meetingName}
      userId={data.user.id}
      userName={data.user.name}
      userImage={data.user.image ?? ""}
    />
  );
};
