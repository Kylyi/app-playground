import { z } from 'zod'

export default defineEventHandler(async event => {
  const args = await getValidatedQuery<UserFindManyArgs>(
    event,
    z.any().parse,
  )

  return db.user.findMany(args) as Promise<UserFull[]>
})
