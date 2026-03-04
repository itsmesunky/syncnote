import { z } from "zod";

export const meetingsInsertSchema = z.object({
  name: z.string().min(1, { message: "면접 이름은 필수 입력 사항입니다." }),
  agentId: z.string().min(1, { message: "에이전트는 필수 입력 사항입니다." }),
});

export const meetingsUpdateSchema = meetingsInsertSchema.extend({
  id: z.string().min(1, { message: "면접 ID는 필수 입력 사항입니다." }),
});
