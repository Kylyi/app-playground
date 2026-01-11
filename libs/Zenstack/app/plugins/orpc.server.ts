import { createRouterClient } from '@orpc/server'
import type { IRouterClient } from '$router'
import { router } from '$router'

/**
 * This is part of the Optimize SSR setup.
 *
 * @see {@link https://orpc.dev/docs/adapters/nuxt#optimize-ssr}
 */
export default defineNuxtPlugin(nuxt => {
  const event = useRequestEvent()

  const client: IRouterClient = createRouterClient(router, {
    context: {
      db,
      user: { id: '1', name: 'John Doe' },
    },
  })

  return {
    provide: { client },
  }
})
