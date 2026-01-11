import type { RouterClient } from '@orpc/server'
import { router as userRouter } from '/Users/jk/Projects/gentl/app-playground/libs/User/server/user.router'
import { router as zenstackRouter } from '/Users/jk/Projects/gentl/app-playground/libs/Zenstack/server/zenstack.router'

export const router = {
  user: userRouter,
  zenstack: zenstackRouter,
}

export type IRouter = typeof router
export type IRouterClient = RouterClient<typeof router>
