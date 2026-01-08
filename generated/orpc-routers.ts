import { router as userRouter } from 'C:/Users/jakub/Projects/gentl/app-playground/libs/User/server/user.router'
import { router as zenstackRouter } from 'C:/Users/jakub/Projects/gentl/app-playground/libs/Zenstack/server/zenstack.router'

export const router = {
  user: userRouter,
  zenstack: zenstackRouter,
}

export type IRouter = typeof router
