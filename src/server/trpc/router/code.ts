import { t } from "../trpc";
import { z } from "zod";
import { resolve } from "path";

export const codeRouter = t.router({
  getCode: t.procedure.mutation(async ({ ctx }) => {
    const page = await ctx.prisma.page.create({data:{}});
    return page.code;
  }),
});