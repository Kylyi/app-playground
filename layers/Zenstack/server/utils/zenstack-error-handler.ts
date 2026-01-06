/* eslint-disable no-case-declarations */
import type { H3Error } from 'h3'
import type { ZodError } from 'zod'
import { flattenError, z } from 'zod'
import { ORMErrorReason } from '@zenstackhq/orm'

export function zenstackErrorHandler(
  error: any,
  options?: Partial<H3Error>,
) {
  switch (error.reason) {
    case ORMErrorReason.INVALID_INPUT:
      const zodError = error.cause as unknown as ZodError
      const flatError = flattenError(zodError)

      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid input',
        data: flatError,

        ...options,
      })

      break

    default:
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal server error',
        message: (error as Error).message,

        ...options,
      })
  }
}
