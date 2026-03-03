import { meetingsRouter } from "@/modules/meetings/server/procedure";

import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  meetings: meetingsRouter,
});
export type AppRouter = typeof appRouter;
