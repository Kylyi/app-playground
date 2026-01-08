import { os } from '@orpc/server'

export const dbProviderMiddleware = os
  .$context<{ db?: DbClient }>()
  .middleware(async ({ context, next }) => {
    const _db: DbClient = context.db ?? db

    return next({
      context: { db: _db },
    })
  })
