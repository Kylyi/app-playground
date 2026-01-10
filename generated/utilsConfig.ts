import config0 from '/home/jk/Projects/gentl/app-playground/utilities-config'
import config1 from '/home/jk/Projects/gentl/app-playground/libs/Utilities/config'

export const utilsConfig = customDefu(config0, config1)

export type IIUtilitiesConfig = typeof utilsConfig
export default utilsConfig
