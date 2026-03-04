"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { useConfirm } from "@/hooks/use-confirm";
import { UpdateMeetingDialog } from "@/modules/agents/ui/components/update-meeting-dialog";

import { useRemoveMeeting } from "../../hooks/mutations/use-remove-meeting";
import { useGetMeetingInfo } from "../../hooks/queries/use-get-meeting-info";
import { ActiveState } from "../components/active-state";
import { CompletedState } from "../components/completed-state";
import { MeetingIdViewHeader } from "../components/meeting-id-view-header";
import { ProcessingState } from "../components/processing-state";
import { UpcomingState } from "../components/upcoming-state";

interface Props {
  meetingId: string;
}

export const MeetingIdView = ({ meetingId }: Props) => {
  const router = useRouter();

  const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false);
  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "면접을 삭제하시겠습니까?",
    "삭제한 면접 데이터는 다시 복구할 수 없습니다.",
  );

  const { data } = useGetMeetingInfo(meetingId);
  const { mutateAsync: removeMeeting } = useRemoveMeeting({
    onSuccess: () => {
      router.replace("/meetings");
    },
    onError: (error) => {
      toast.error(error.message, { position: "top-center" });
    },
  });

  const handleRemoveMeeting = async () => {
    const ok = await confirmRemove();
    if (!ok) return;
    await removeMeeting({ id: meetingId });
  };

  const isUpcoming = data.status === "upcoming";
  const isActive = data.status === "active";
  const isProcessing = data.status === "processing";
  const isCompleted = data.status === "completed";

  return (
    <>
      <RemoveConfirmation />
      <UpdateMeetingDialog
        open={updateMeetingDialogOpen}
        onOpenChange={setUpdateMeetingDialogOpen}
        initialValues={data}
      />
      <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
        <MeetingIdViewHeader
          meetingId={meetingId}
          meetingName={data.name}
          onEdit={() => setUpdateMeetingDialogOpen(true)}
          onRemove={handleRemoveMeeting}
        />
        {isUpcoming && <UpcomingState meetingId={meetingId} />}
        {isActive && <ActiveState meetingId={meetingId} />}
        {isProcessing && <ProcessingState />}
        {isCompleted && <CompletedState data={data} />}
      </div>
    </>
  );
};
