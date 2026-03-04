"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { VideoIcon } from "lucide-react";
import { toast } from "sonner";

import { GeneratedAvatar } from "@/components/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { useConfirm } from "@/hooks/use-confirm";

import { useRemoveAgent } from "../../hooks/mutations/use-remove-agent";
import { useGetAgentInfo } from "../../hooks/queries/use-get-agent-info";
import { AgentIdViewHeader } from "../components/agent-id-view-header";
import { UpdateAgentDialog } from "../components/update-agent-dialog";

interface Props {
  agentId: string;
}

export const AgentIdView = ({ agentId }: Props) => {
  const router = useRouter();
  const [updateAgentDialogOpen, setUpdateAgentDialogOpen] = useState(false);

  const { data } = useGetAgentInfo(agentId);
  const { name, meetingCount, instructions } = data;

  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "에이전트를 삭제하시겠습니까?",
    "에이전트 삭제 시, 에이전트가 참여한 면접이 함께 삭제됩니다.",
  );

  const { mutateAsync: removeAgent } = useRemoveAgent({
    onSuccess: () => {
      router.push("/agents");
    },
    onError: (error) => {
      toast.error(error.message, {
        position: "top-center",
      });
    },
  });

  const handleRemoveAgent = async () => {
    const ok = await confirmRemove();
    if (!ok) return;
    await removeAgent({ id: agentId });
  };

  return (
    <>
      <RemoveConfirmation />
      <UpdateAgentDialog
        open={updateAgentDialogOpen}
        onOpenChange={setUpdateAgentDialogOpen}
        initialValues={data}
      />
      <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
        <AgentIdViewHeader
          agentId={agentId}
          agentName={name}
          onEdit={() => setUpdateAgentDialogOpen(true)}
          onRemove={handleRemoveAgent}
        />
        <div className="bg-white rounded-lg border">
          <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
            <div className="flex items-center gap-x-3">
              <GeneratedAvatar variant="botttsNeutral" seed={name} className="size-10" />
              <h2 className="text-2xl font-medium">{name}</h2>
            </div>
            <Badge variant="outline" className="flex items-center gap-x-2 [&>svg]:size-4">
              {0 < meetingCount ? (
                <>
                  <VideoIcon className="text-blue-700" />총 {meetingCount}회 면접 참여
                </>
              ) : (
                <>첫 면접을 기다리고 있어요</>
              )}
            </Badge>
            <div className="flex flex-col gap-y-4">
              <p className="text-lg font-medium">역할 및 행동 지침</p>
              <p className="text-neutral-800">{instructions}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
