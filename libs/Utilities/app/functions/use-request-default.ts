// import utilsConfig from '$utilsConfig'
// import type { NonUndefined } from 'utility-types'

// // Types
// import type { IZodValidationOutput } from '../types/zod'

// const memoizedRequests = new Map<string, Promise<any>>()

// export type AsyncFunction<T> = (abortController: () => AbortController) => Promise<T>

// export type UseRequestOptions<T = any> = {
//   /**
//    * The request ID
//    */
//   requestId?: string

//   /**
//    * The key for the payload object
//    *
//    * Falls back to the `utilsConfig.request.payloadKey` if not provided
//    * Provide `null` to ignore the payload key
//    */
//   payloadKey?: string

//   /**
//    * The function to modify the response object
//    */
//   modifyFnc?: (obj: any) => any

//   /**
//    * Zod validation output (the result from `useZod`)
//    */
//   $z?: IZodValidationOutput<any>

//   /**
//    * We can merge the response with the original object
//    */
//   merge?: {
//     /**
//      * The key for the payload object (specifically for the `merge` functionality)
//      * Can be different from the `payloadKey`
//      */
//     payloadKey?: string

//     /**
//      * The original object
//      */
//     originalObj: MaybeRefOrGetter<any>

//     /**
//      * Override the original object with the modified object
//      * By default, the original object will be merged with the new object (via Object.assign)
//      */
//     override?: boolean

//     /**
//      * The function to modify the response object
//      */
//     modifyFnc?: (obj: any) => any
//   }

//   /**
//    * When valid request is done, we call this function
//    */
//   onComplete?: (payload: { response: any, result: T }) => void

//   /**
//    * The function to handle the error
//    */
//   onError?: (payload: { error: any, response: any }) => Promise<any> | any
// }

// function mergeResponseWithOriginalObject<T>(payload: {
//   merge: NonUndefined<UseRequestOptions<T>['merge']>
//   result: T
// }) {
//   const { merge, result } = payload

//   const newData = merge?.payloadKey ? get(result, merge.payloadKey) : result
//   const modifyFnc = merge?.modifyFnc ?? (utilsConfig.request.useRequestOptions?.modifyFnc || ((obj: any) => obj))
//   const newDataModified = modifyFnc(newData)

//   if (newData) {
//     // When `merge.override` is true, we sync the original object with the new data
//     // essentially replacing the original object
//     if (merge?.override) {
//       merge.originalObj.syncToParent?.(newDataModified)
//     }

//     // Otherwise, we merge the new data with the original object
//     else {
//       const originalObj = toValue(merge.originalObj)
//       const resultObj = Object.assign(originalObj, newDataModified)

//       merge.originalObj.syncToParent?.(resultObj)
//     }
//   }
// }

// /**
//  * Executes a request with optional memoization
//  */
// async function executeRequest<T>(payload: {
//   fnc: AsyncFunction<T>
//   requestId?: string
//   createAbortController?: () => AbortController
// }): Promise<T> {
//   const { fnc, requestId, createAbortController } = payload

//   // If no requestId is provided, execute directly without memoization
//   if (!requestId) {
//     return fnc(createAbortController!)
//   }

//   // Check if we already have a memoized request
//   const existingRequest = memoizedRequests.get(requestId)
//   if (existingRequest) {
//     return existingRequest
//   }

//   // Create and store new memoized request
//   const newRequest = fnc(createAbortController!)
//   memoizedRequests.set(requestId, newRequest)

//   return newRequest
// }

// export function useRequest(options?: { loadingInitialState?: boolean }) {
//   const { loadingInitialState } = options ?? {}

//   // State
//   const error = ref<any>()
//   const isLoading = ref(loadingInitialState ?? false)
//   const abortController = ref<AbortController>()

//   function createAbortController() {
//     abortController.value = new AbortController()

//     return abortController.value
//   }

//   async function handleRequest<T = any>(
//     fnc: AsyncFunction<T>,
//     options?: UseRequestOptions<T>,
//   ): Promise<T> {
//     const {
//       requestId,
//       merge,
//       $z,
//       onComplete,
//     } = options ?? {}

//     let response: any
//     let result: any

//     try {
//       // Initialize
//       error.value = undefined
//       response = undefined
//       result = undefined

//       const payloadKey = options?.payloadKey
//         ? options.payloadKey
//         : isNull(options?.payloadKey) ? undefined : utilsConfig.request.useRequestOptions?.payloadKey

//       // Validate
//       if ($z) {
//         const isValid = await $z.value.$validate()

//         if (!isValid) {
//           throw new Error($t('general.invalidForm'))
//         }
//       }

//       isLoading.value = true

//       // Handle memoized requests
//       response = await executeRequest({ fnc, requestId, createAbortController })
//       result = payloadKey ? get(response, payloadKey) : response

//       // When `merge` is used, we merge the response with the original object
//       if (merge) {
//         mergeResponseWithOriginalObject({ merge, result })
//       }

//       $z?.value.$reset()

//       return result as T
//     } catch (_error: any) {
//       error.value = _error

//       return new Promise((_resolve, reject) => reject(error))
//     } finally {
//       isLoading.value = false

//       if (error && options?.onError) {
//         await options.onError({ error: error.value, response })
//       } else if (onComplete) {
//         onComplete({ response, result })
//       }

//       if (requestId) {
//         memoizedRequests.delete(requestId)
//       }

//       isLoading.value = false
//     }
//   }

//   return {
//     isLoading,
//     abortController,
//     handleRequest,
//   }
// }
