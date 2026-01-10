export default publicProcedure
  .route({
    method: 'GET',
    path: '/users/find-by-id',
    description: 'Find a user by ID',
    tags: ['Users'],
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    return db.user.findUnique({ where: { id: input.id } })
  })
