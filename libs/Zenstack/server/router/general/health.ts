export default publicProcedure
  .route({
    method: 'GET',
    description: 'Check the health of the oRPC',
    path: '/general/health',
    tags: ['General'],
  })
  .output(z.literal('ok'))
  .handler(() => {
    return 'ok'
  })
