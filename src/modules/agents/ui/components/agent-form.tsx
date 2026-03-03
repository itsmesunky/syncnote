import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

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

  const { mutate: createAgent, isPending: isPendingCreateAgent } = useCreateAgent({
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);

      // TODO: 사용 한도 관련 코드 체크
      if (error.data?.code === "FORBIDDEN") router.push("/upgrade");
    },
  });

  const { mutate: updateAgent, isPending: isPendingUpdateAgent } = useUpdateAgent({
    onSuccess: async () => {
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof agentsInsertSchema>>({
    resolver: zodResolver(agentsInsertSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      instructions: initialValues?.instructions ?? "",
    },
  });

  const isEdit = !!initialValues?.id;
  const onSubmit = (values: z.infer<typeof agentsInsertSchema>) => {
    if (isEdit) {
      updateAgent({ ...values, id: initialValues.id });
    } else {
      createAgent(values);
    }
  };

  const isPending = isPendingCreateAgent || isPendingUpdateAgent;

  return <></>;
};
