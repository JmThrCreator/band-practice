import { t } from "../trpc";
import { z } from "zod";
import { resolve } from "path";

export const songRouter = t.router({
    getSongs: t.procedure
        .input(z.object({ code: z.string() }))
        .query(async ({ ctx, input }) => {
            const songList = await ctx.prisma.song.findMany({
                where: {
                    page: {
                        code: input.code
                    }
                },
                select: {
                    id: true,
                    name: true,
                    progress: true,
                    stage: true,
                    songEntry: true,
                }
            })
            return(songList.sort(
                function(a, b) {
                    var textA = a.name.toUpperCase();
                    var textB = b.name.toUpperCase();
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                }
            ))
        }),
    getSong: t.procedure
        .input(z.object({ code: z.string() }))
        .query(async ({ ctx, input }) => {
            const song = await ctx.prisma.song.findFirst({
                where: {
                    page: {
                        code: input.code
                    }
                },
                select: {
                    id: true,
                    name: true,
                    progress: true,
                    stage: true,
                    songEntry: true,
                }
            })
            return(song)
        }),
    createSong: t.procedure
        .input(z.object({ code: z.string(), data: z.object({ stageId: z.number() }) }))
        .mutation(async ({ ctx, input }) => {

            const page = await ctx.prisma.page.findFirst({
                where: {
                    code: input.code
                },
                select: {
                    id: true
                }
            });

            if (page) {
                const song = await ctx.prisma.song.create({
                    data: {
                        pageId: page.id,
                        progressId: 4,
                        stageId: input.data.stageId,
                        name: "",
                    },
                })
                
                const defaultPlayerList = await ctx.prisma.player.findMany({
                    where: {
                        pageId: page.id
                    }
                });
                
                for (let i=0; i<defaultPlayerList.length; i++) {
                    let player = defaultPlayerList[i]
                    if (player !== undefined && player.default) {
                        let instrument = await ctx.prisma.instrument.findFirst({
                            where: {
                                id:player.instrumentId
                            }
                        })
                        if (instrument)
                            await ctx.prisma.songEntry.create({
                                data: {
                                    songId: song.id,
                                    name:instrument.name,
                                    progressId: 4,
                                    instrumentId: player.instrumentId,
                                    playerId: player.id
                                },
                            })
                    }
                }
            }
            return
        }),
    deleteSong: t.procedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {

            const song = await ctx.prisma.song.findFirst({
                where: {
                    id: input.id
                },
                select: {
                    id: true
                }
            })

            if (song)
                await ctx.prisma.song.delete({
                    where: {
                        id: song.id
                    }
                })
            
            return
        }),
    editSongName: t.procedure
        .input(z.object({ id: z.string(), name: z.string() }))
        .mutation(async ({ ctx, input }) => {

            const song = await ctx.prisma.song.findFirst({
                where: {
                    id: input.id
                },
                select: {
                    id: true
                }
            })

            if (song)
                await ctx.prisma.song.update({
                    where: {
                        id: song.id
                    },
                    data: {
                        name: input.name
                    }
                })
            
            return
        }),
    editSongProgress: t.procedure
        .input(z.object({ id: z.string(), progressId: z.number() }))
        .mutation(async ({ ctx, input }) => {

            const song = await ctx.prisma.song.findFirst({
                where: {
                    id: input.id
                },
                select: {
                    id: true
                }
            })

            if (song)
                await ctx.prisma.song.update({
                    where: {
                        id: song.id
                    },
                    data: {
                        progressId: input.progressId
                    }
                })
            
            return
        }),
    editSongStage: t.procedure
    .input(z.object({ id: z.string(), stageId: z.number() }))
    .mutation(async ({ ctx, input }) => {

        const song = await ctx.prisma.song.findFirst({
            where: {
                id: input.id
            },
            select: {
                id: true
            }
        })

        if (song)
            await ctx.prisma.song.update({
                where: {
                    id: song.id
                },
                data: {
                    stageId: input.stageId
                }
            })
        
        return
    }), 
});