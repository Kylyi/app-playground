import { os } from '@orpc/server'

// Types
import type { IORPCContext } from '../types/orpc-context.type'

// Middleware
import { dbProviderMiddleware } from '../orpc-middleware/db.middleware'

export const publicProcedure = os
  .$context<IORPCContext>()
  .use(dbProviderMiddleware)
