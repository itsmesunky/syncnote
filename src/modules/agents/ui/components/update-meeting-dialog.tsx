import { ResponsiveDialog } from "@/components/responsive-dialog";
import { MeetingGetOne } from "@/modules/meetings/types";
import { MeetingForm } from "@/modules/meetings/ui/components/meeting-form";

interface UpdateMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: MeetingGetOne;
}

export const UpdateMeetingDialog = ({
  open,
  onOpenChange,
  initialValues,
}: UpdateMeetingDialogProps) => {
  return (
    <ResponsiveDialog
      title="면접 정보 수정"
      description="면접의 세부 내용을 다시 설정합니다."
      open={open}
      onOpenChange={onOpenChange}
    >
      <MeetingForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
        initialValues={initialValues}
      />
    </ResponsiveDialog>
  );
};
