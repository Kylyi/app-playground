import z from 'zod'
import { os } from '@orpc/server'

// Procedures
import { publicProcedure } from '#layers/zenstack/server/procedures/public.procedure'

export const router = {
  findById: publicProcedure
    .route({
      method: 'GET',
      path: '/user/findById',
      description: 'Find a user by ID',
      tags: ['User'],
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      return db.user.findUnique({ where: { id: input.id } })
    }),

  findMany: os
    .route({
      method: 'GET',
      path: '/user/findMany',
      description: 'Find many users',
      tags: ['User'],
    })
    .handler(async () => {
      return db.user.findMany()
    }),
}
