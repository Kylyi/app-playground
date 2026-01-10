import { router as userRouter } from '/home/jk/Projects/gentl/app-playground/libs/User/server/user.router'
import { router as zenstackRouter } from '/home/jk/Projects/gentl/app-playground/libs/Zenstack/server/zenstack.router'

export const router = {
  user: userRouter,
  zenstack: zenstackRouter,
}

export type IRouter = typeof router
