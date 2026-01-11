import { createRouterClient } from '@orpc/server'
import type { RouterClient } from '@orpc/server'
import { router } from '$router'

/**
 * This is part of the Optimize SSR setup.
 *
 * @see {@link https://orpc.dev/docs/adapters/nuxt#optimize-ssr}
 */
export default defineNuxtPlugin(nuxt => {
  const event = useRequestEvent()

  const client: RouterClient<typeof router> = createRouterClient(router, {
    context: {
      db,
      user: { id: '1', name: 'John Doe' },
    },
  })

  return {
    provide: { client },
  }
})
