export default publicProcedure
  .route({
    method: 'GET',
    path: '/users/find-many',
    description: 'Find many users',
    tags: ['Users'],
  })
  .input(z.object({ id: z.string(), age: z.number().min(1) }))
  .handler(async ({ input }) => {
    return db.user.findMany() as Promise<UserFull[]>
  })
