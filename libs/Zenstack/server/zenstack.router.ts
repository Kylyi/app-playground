import { publicProcedure } from './procedures/public.procedure'

export const router = {
  health: publicProcedure
    .handler(async () => {
      return 'ok' as const
    }),
}
