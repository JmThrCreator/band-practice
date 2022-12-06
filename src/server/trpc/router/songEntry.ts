import { t } from "../trpc";
import { number, z } from "zod";
import { resolve } from "path";

export const songEntryRouter = t.router({
    getSongEntryList: t.procedure
        .input(z.object({ songId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.songEntry.findMany({
                where: {
                    song: {
                        id: input.songId
                    }
                },
                select: {
                    id: true,
                    name: true,
                    progress: true,
                    instrument: true,
                    player: true,
                    songId: true,
                }
            })
        }),
    createSongEntry: t.procedure
        .input(z.object({ songId: z.string() }))
        .mutation(async ({ ctx, input }) => {

            await ctx.prisma.songEntry.create({
                data: {
                    songId: input.songId,
                    name:"",
                    progressId: 4,
                    instrumentId: 6,
                },
            })
            
            return
    }),
    deleteSongEntry: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {

        const songEntry = await ctx.prisma.songEntry.findFirst({
            where: {
                id: input.id
            },
            select: {
                id: true
            }
        })

        if (songEntry)
            await ctx.prisma.songEntry.delete({
                where: {
                    id: songEntry.id
                }
            })
        
        return
    }),
    editSongEntryName: t.procedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
        
        const songEntry = await ctx.prisma.songEntry.findFirst({
            where: {
                id: input.id
            },
            select: {
                id: true
            }
        })

        if (songEntry)
            await ctx.prisma.songEntry.update({
                where: {
                    id: songEntry.id
                },
                data: {
                    name: input.name
                }
            })
        
        return
    }),
    editSongEntryProgress: t.procedure
        .input(z.object({ id: z.string(), progressId: z.number() }))
        .mutation(async ({ ctx, input }) => {

            const songEntry = await ctx.prisma.songEntry.findFirst({
                where: {
                    id: input.id
                },
                select: {
                    id: true
                }
            })

            if (songEntry)
                await ctx.prisma.songEntry.update({
                    where: {
                        id: songEntry.id
                    },
                    data: {
                        progressId: input.progressId
                    }
                })
            
            return
        }),
    editSongEntryInstrument: t.procedure
        .input(z.object({ id: z.string(), instrumentId: z.number() }))
        .mutation(async ({ ctx, input }) => {

            const songEntry = await ctx.prisma.songEntry.findFirst({
                where: {
                    id: input.id
                },
                select: {
                    id: true
                }
            })

            if (songEntry)
                await ctx.prisma.songEntry.update({
                    where: {
                        id: songEntry.id
                    },
                    data: {
                        instrumentId: input.instrumentId
                    }
                })
            
            return
        }),
        editSongEntryPlayer: t.procedure
        .input(z.object({ id: z.string(), playerId: z.string() }))
        .mutation(async ({ ctx, input }) => {

            const songEntry = await ctx.prisma.songEntry.findFirst({
                where: {
                    id: input.id
                },
                select: {
                    id: true
                }
            })

            if (songEntry)
                await ctx.prisma.songEntry.update({
                    where: {
                        id: songEntry.id
                    },
                    data: {
                        playerId: input.playerId
                    }
                })
            
            return
        }),
});