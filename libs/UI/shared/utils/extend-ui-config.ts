// Types
import type { IUIConfig } from '../../config'

export function extendUIConfig<T extends Partial<IUIConfig> & IItem>(config: T): T {
  return config
}
