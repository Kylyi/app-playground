export default defineEventHandler(async event => {
  const args = getQuery<UserFindManyArgs>(event)

  return db.user.findMany(args) as Promise<UserFull[]>
})
