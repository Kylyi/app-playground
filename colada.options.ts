import { ORPCError } from '@orpc/client'
import type { PiniaColadaOptions, PiniaColadaPlugin } from '@pinia/colada'
import type { $ZodIssue } from 'zod/v4/core'

// Functions
import { translateZodIssue } from './libs/Utilities/app/functions/translate-zod-issue'

export function PiniaColadaErrorHandlerPlugin(): PiniaColadaPlugin {
  return ({ queryCache }) => {
    queryCache.$onAction(({ name, args, onError }) => {
      // console.log('name', name, args)

      if (name === 'setEntryState') {
        const [entry, state] = args

        if (state.error) {
          const isORPCError = state.error instanceof ORPCError

          // Validation issues
          // @ts-expect-error
          if (isORPCError && state.error.message === 'Input validation failed') {
            const zodError = (state.error as any).data as { issues: $ZodIssue[] }
            const translatedIssues = zodError.issues.map(issue => translateZodIssue(issue as any))
          }
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
      const isORPCError = error instanceof ORPCError

      // Validation issues
      if (isORPCError && error.message === 'Input validation failed') {
        const zodError = (error as any).data as { issues: $ZodIssue[] }
        const translatedIssues = zodError.issues.map(issue => translateZodIssue(issue as any))
      }
    },
  },
} satisfies PiniaColadaOptions
