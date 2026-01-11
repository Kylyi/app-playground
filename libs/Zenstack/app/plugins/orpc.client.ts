import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { RouterClient } from '@orpc/server'
import type { IRouterClient } from '$router'

export default defineNuxtPlugin(() => {
  const event = useRequestEvent()

  const link = new RPCLink({
    url: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/rpc`,
    headers: event?.headers,
  })

  const client = createORPCClient(link) as IRouterClient

  return {
    provide: { client },
  }
})
