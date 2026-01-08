import { PiniaColadaQueryHooksPlugin } from '@pinia/colada'
import type { PiniaColadaOptions, PiniaColadaPlugin } from '@pinia/colada'

export function PiniaColadaErrorHandlerPlugin(): PiniaColadaPlugin {
  return ({ queryCache }) => {
    queryCache.$onAction(({ name, args, onError }) => {
      console.log('name', name, args)

      if (name === 'setEntryState') {
        const [entry, state] = args

        if (state.error) {
          // @ts-expect-error
          const errorData = state.error?.data?.data as { reason: string, message: string }[]

          console.log('Request failed for', entry.key, errorData)
        }
      }

      onError(error => {
        console.log('error', error)
      })
    })
  }
}

export default {
  plugins: [PiniaColadaErrorHandlerPlugin()],
  mutationOptions: {
    onError(error) {
      console.log('onError', error.data)
    },
  },
} satisfies PiniaColadaOptions
