import { ORPCError } from '@orpc/server'
import { publicProcedure } from './public.procedure'

export const protectedProcedure = publicProcedure.use(({ context, next }) => {
  if (!context.user) {
    throw new ORPCError('UNAUTHORIZED')
  }

  return next({ context })
})
