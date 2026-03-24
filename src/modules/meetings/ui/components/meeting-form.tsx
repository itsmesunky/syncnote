import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CommandSelect } from "@/components/command-select";
import { FormInput } from "@/components/form-input";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NewAgentDialog } from "@/modules/agents/ui/components/new-agent-dialog";

import { useCreateMeeting } from "../../hooks/mutations/use-create-meeting";
import { useUpdateMeeting } from "../../hooks/mutations/use-update-meeting";
import { useGetAgents } from "../../hooks/queries/use-get-agents";
import { meetingsInsertSchema } from "../../schemas";
import { MeetingGetOne } from "../../types";

interface MeetingFormProps {
  onSuccess?: (id?: string) => void;
  onCancel?: () => void;
  initialValues?: MeetingGetOne;
}

export const MeetingForm = ({ onSuccess, onCancel, initialValues }: MeetingFormProps) => {
  const [agentSearch, setAgentSearch] = useState("");
  const agents = useGetAgents(agentSearch);

  const [openNewAgentDialog, setOpenNewAgentDialog] = useState(false);

  const isEdit = !!initialValues?.id;

  const router = useRouter();

  const methods = useForm<z.infer<typeof meetingsInsertSchema>>({
    resolver: zodResolver(meetingsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      agentId: initialValues?.agentId ?? "",
    },
  });

  const { control, handleSubmit } = methods;

  const { mutate: createMeeting, isPending: isPendingCreateMeeting } = useCreateMeeting({
    onSuccess: (id) => {
      onSuccess?.(id);
    },
    onError: (error) => {
      toast.error(error.message, {
        position: "top-center",
      });

      if (error.data?.code === "FORBIDDEN") {
        router.push("/upgrade");
      }
    },
  });

  const { mutate: updateMeeting, isPending: isPendingUpdateMeeting } = useUpdateMeeting({
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message, {
        position: "top-center",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
    if (isEdit) {
      updateMeeting({ ...values, id: initialValues.id });
    } else {
      createMeeting({ ...values });
    }
  };

  const isPending = isPendingCreateMeeting || isPendingUpdateMeeting;

  return (
    <>
      <NewAgentDialog open={openNewAgentDialog} onOpenChange={setOpenNewAgentDialog} />
      <Form {...methods}>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            control={control}
            fieldName="name"
            placeholder="면접명을 입력해 주세요."
            label="면접명"
          />
          <FormField
            name="agentId"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>에이전트</FormLabel>
                <FormControl>
                  <CommandSelect
                    options={(agents.data?.items ?? []).map((agent) => ({
                      id: agent.id,
                      value: agent.id,
                      children: (
                        <div className="flex items-center gap-x-2">
                          <GeneratedAvatar
                            seed={agent.name}
                            variant="botttsNeutral"
                            className="border size-6"
                          />
                          <span>{agent.name}</span>
                        </div>
                      ),
                    }))}
                    onSelect={field.onChange}
                    onSearch={setAgentSearch}
                    value={field.value}
                    placeholder="에이전트를 선택해 주세요."
                  />
                </FormControl>
                <FormDescription>
                  원하는 에이전트가 목록에 없나요?{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline cursor-pointer"
                    onClick={() => setOpenNewAgentDialog(true)}
                  >
                    새 에이전트 만들기
                  </button>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between gap-x-2">
            {onCancel && (
              <Button variant="ghost" disabled={isPending} type="button" onClick={() => onCancel()}>
                닫기
              </Button>
            )}
            <Button disabled={isPending} type="submit">
              {isEdit ? "수정" : "등록"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
