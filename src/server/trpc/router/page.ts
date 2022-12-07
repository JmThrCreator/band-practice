import { t } from "../trpc";
import { z } from "zod";

export const pageRouter = t.router({
  getProgressList: t.procedure.query(async ({ ctx }) => {
    return ctx.prisma.progress.findMany();
  }),
  getStageList: t.procedure.query(async ({ ctx }) => {
    return ctx.prisma.stage.findMany();
  }),
  getInstrumentList: t.procedure.query(async ({ ctx }) => {
    return ctx.prisma.instrument.findMany();
  }),

  getPlayerList: t.procedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
    
      const page = await ctx.prisma.page.findFirst({
        where: {
            code: input.code
        },
        select: {
            id: true
        }
      })
      if (page) 
        return ctx.prisma.player.findMany({
          where: {
            pageId:page.id
          }
        });
      else return []
  }),
  createPlayer: t.procedure
    .input(z.object({ code: z.string(), default: z.boolean() }))
    .mutation(async ({ ctx, input }) => {

      const page = await ctx.prisma.page.findFirst({
        where: {
            code: input.code
        },
        select: {
            id: true
        }
      })
      if (page) 
        return ctx.prisma.player.create({
            data: {
                pageId:page.id,
                name:"",
                instrumentId:6,
                default:input.default,
            },
        })
        
        return
  }),
  deletePlayer: t.procedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {

      await ctx.prisma.player.delete({
          where: {
              id: input.id
          }
      })
      return
  }),
  editPlayerInstrument: t.procedure
  .input(z.object({ id: z.string(), instrumentId: z.number() }))
  .mutation(async ({ ctx, input }) => {

      await ctx.prisma.player.update({
        where: {
          id: input.id
        },
        data: {
          instrumentId: input.instrumentId
        }
      })
      
      return
  }),
  editPlayerName: t.procedure
  .input(z.object({ id: z.string(), name: z.string() }))
  .mutation(async ({ ctx, input }) => {

      await ctx.prisma.player.update({
        where: {
          id: input.id
        },
        data: {
          name: input.name
        }
      })
      
      return
  }),
});