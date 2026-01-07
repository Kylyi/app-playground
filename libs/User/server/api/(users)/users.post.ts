import { z } from 'zod'

export default defineEventHandler(async event => {
  const args = await readValidatedBody<UserCreateArgs>(event, z.any().parse)

  return db.user.create(args)
})
