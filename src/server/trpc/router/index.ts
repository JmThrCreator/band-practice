// src/server/trpc/router/index.ts
import { t } from "../trpc";
import { codeRouter } from "./code";
import { authRouter } from "./auth";
import { pageRouter } from "./page";
import { songRouter } from "./song";
import { songEntryRouter } from "./songEntry";

export const appRouter = t.router({
  page: pageRouter,
  code: codeRouter,
  auth: authRouter,
  song: songRouter,
  songEntry: songEntryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
