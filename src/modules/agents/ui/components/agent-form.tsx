"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { FormInput } from "@/components/form-input";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { useCreateAgent } from "../../hooks/mutations/use-create-agent";
import { useUpdateAgent } from "../../hooks/mutations/use-update-agent";
import { agentsInsertSchema } from "../../schemas";
import { AgentGetOne } from "../../types";

interface Props {
  initialValues?: AgentGetOne;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AgentForm = ({ initialValues, onSuccess, onCancel }: Props) => {
  const router = useRouter();
  const isEdit = !!initialValues?.id;

  const { mutate: createAgent, isPending: isPendingCreateAgent } = useCreateAgent({
    onSuccess: () => {
      toast.info("에이전트가 등록되었어요.", {
        position: "top-center",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message, {
        position: "top-center",
      });

      // TODO: 사용 한도 관련 코드 체크
      if (error.data?.code === "FORBIDDEN") router.push("/upgrade");
    },
  });

  const { mutate: updateAgent, isPending: isPendingUpdateAgent } = useUpdateAgent({
    onSuccess: async () => {
      toast.info("에이전트가 수정되었어요.", {
        position: "top-center",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message, {
        position: "top-center",
      });
    },
  });

  const methods = useForm<z.infer<typeof agentsInsertSchema>>({
    resolver: zodResolver(agentsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      instructions: initialValues?.instructions ?? "",
    },
  });

  const { control, watch, handleSubmit } = methods;

  const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
    if (isEdit) {
      updateAgent({ ...values, id: initialValues.id });
    } else {
      createAgent(values);
    }
  };

  const isPending = isPendingCreateAgent || isPendingUpdateAgent;

  return (
    <Form {...methods}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <GeneratedAvatar seed={watch("name")} variant="botttsNeutral" className="border size-16" />
        <FormInput
          control={control}
          fieldName="name"
          label="이름"
          placeholder="10년 차 시니어 개발자 깐깐봇"
        />
        <FormInput
          control={control}
          fieldName="instructions"
          label="역할 및 행동 지침"
          contentType="textarea"
          placeholder="에이전트 에게 부여할 성격, 주요 질문 주제, 말투 등을 구체적으로 작성해 주세요."
          className="min-h-25 max-h-75 overflow-y-auto resize-none"
        />
        <div className="flex justify-between gap-x-2">
          {onCancel && (
            <Button type="button" variant="ghost" disabled={isPending} onClick={() => onCancel()}>
              닫기
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isEdit ? "수정" : "등록"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
