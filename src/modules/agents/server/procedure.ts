import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import z from "zod";

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { createTRPCRouter, premiumProcedure, protectedProcedure } from "@/trpc/init";

import { agentsInsertSchema, agentsUpdateSchema } from "../schemas";

export const agentsRouter = createTRPCRouter({
  getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    const [existingAgent] = await db
      .select({
        ...getTableColumns(agents),
        meetingCount: db.$count(meetings, eq(agents.id, meetings.agentId)),
      })
      .from(agents)
      .where(and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)));

    if (!existingAgent) {
      throw new TRPCError({ code: "NOT_FOUND", message: "에이전트를 찾을 수 없습니다." });
    }

    return existingAgent;
  }),
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { search, page, pageSize } = input;

      const data = await db
        .select({
          ...getTableColumns(agents),
          meetingCount: db.$count(meetings, eq(agents.id, meetings.agentId)),
          totalCount: sql<number>`COUNT(*) OVER()`.as("total_count"),
        })
        .from(agents)
        .where(
          and(
            eq(agents.userId, ctx.auth.user.id),
            search ? ilike(agents.name, `%${search}%`) : undefined,
          ),
        )
        .orderBy(desc(agents.createdAt), desc(agents.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const totalCount = data[0]?.totalCount ?? 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        items: data,
        total: totalCount,
        totalPages,
      };
    }),
  create: premiumProcedure("agents")
    .input(agentsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const [createdAgent] = await db
        .insert(agents)
        .values({
          ...input,
          userId: ctx.auth.user.id,
        })
        .returning();

      return createdAgent;
    }),
  update: protectedProcedure.input(agentsUpdateSchema).mutation(async ({ ctx, input }) => {
    const [updatedAgent] = await db
      .update(agents)
      .set(input)
      .where(and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)))
      .returning();

    if (!updatedAgent) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "에이전트를 찾을 수 없습니다.",
      });
    }

    return updatedAgent;
  }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [removedAgent] = await db
        .delete(agents)
        .where(and(eq(agents.id, input.id), eq(agents.userId, ctx.auth.user.id)))
        .returning();

      if (!removedAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "에이전트를 찾을 수 없습니다.",
        });
      }

      return removedAgent;
    }),
  cleanupTestAgents: protectedProcedure.mutation(async ({ ctx }) => {
    if (process.env.E2E_TEST !== "true") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "E2E 테스트 환경에서만 사용할 수 있는 API입니다.",
      });
    }

    const removedAgents = await db
      .delete(agents)
      .where(and(eq(agents.userId, ctx.auth.user.id), ilike(agents.name, "%[E2E]%")))
      .returning();

    return removedAgents;
  }),
});
