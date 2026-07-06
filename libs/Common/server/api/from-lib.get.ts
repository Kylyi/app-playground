import { serverFnc } from '../../../../server/utils/server-fnc'
import { fromServer } from '../utils/from-server'

export default defineEventHandler(() => {
  return {
    fromServer: fromServer(),
    serverFnc: serverFnc(),
  }
})
