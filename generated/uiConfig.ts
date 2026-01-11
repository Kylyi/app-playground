import { customDefu } from '#layers/utilities/shared/utils/custom-defu'
import config0 from '/Users/jk/Projects/gentl/app-playground/libs/UI/config'

const uiConfigMerged = customDefu(config0)

type WrapObjects<T> = {
  [K in keyof T]: T[K] extends Array<any> | object
    ? T[K] extends null
      ? null
      : () => T[K]
    : T[K];
}

function wrapObjects<T extends Record<string, any>>(obj: T): WrapObjects<T> {
  const result = {} as WrapObjects<T>

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]

      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        (result as any)[key] = () => value
      } else {
        (result as any)[key] = value
      }
    }
  }

  return result
}

type WrapProps<T> = {
  [K in keyof T]: T[K] extends { props: infer P }
    ? { props: WrapObjects<P> } & Omit<T[K], "props">
    : T[K];
};

function wrapProps<T extends Record<string, any>>(obj: T): WrapProps<T> {
  const result = {} as WrapProps<T>;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (
        typeof value === "object" &&
        value !== null &&
        "props" in value &&
        typeof value.props === "object" &&
        value.props !== null
      ) {
        (result as any)[key] = {
          ...value,
          props: wrapObjects(value.props),
        };
      } else {
        (result as any)[key] = value;
      }
    }
  }

  return result;
}

export const uiConfig = wrapProps(uiConfigMerged)

export type IUIConfig = typeof uiConfig
export default uiConfig
