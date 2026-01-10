import config0 from '/Users/jk/Projects/gentl/app-playground/utilities-config'
import config1 from '/Users/jk/Projects/gentl/app-playground/libs/Utilities/config'

export const utilsConfig = customDefu(config0, config1)

export type IIUtilitiesConfig = typeof utilsConfig
export default utilsConfig
