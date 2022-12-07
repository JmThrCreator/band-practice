import { t } from "../trpc";
import { z } from "zod";

export const codeRouter = t.router({
  getCode: t.procedure.mutation(async ({ ctx }) => {
    const page = await ctx.prisma.page.create({data:{}});
    return page.code;
  }),
  validateCode: t.procedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const isCodeValid = await ctx.prisma.page.findFirst({
        where: {
          code: input.code
        }
      })
      if (isCodeValid) return true
      else return false
  }),
});