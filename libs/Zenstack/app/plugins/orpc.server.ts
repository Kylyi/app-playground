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

  const client = createRouterClient(router, {
    context: {
      db,
      user: { id: '1', name: 'John Doe' },
    },
  }) as IRouterClient

  return {
    provide: { client },
  }
})
