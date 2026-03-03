import { z } from "zod";

export const agentsInsertSchema = z.object({
  name: z.string().min(1, { message: "이름은 필수 입력 사항입니다." }),
  instructions: z
    .string()
    .min(1, { message: "에이전트가 수행해야 할 역할과 행동 지침을 구체적으로 작성해 주세요." }),
});

export const agentsUpdateSchema = agentsInsertSchema.extend({
  id: z.string().min(1, { message: "ID는 필수 입력 사항입니다." }),
});
