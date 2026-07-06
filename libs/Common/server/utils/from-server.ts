import { fromShared } from '..//../shared/utils/from-shared'

export function fromServer() {
  return `fromServer-${fromShared()}`
}
