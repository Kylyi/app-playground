import { expect } from '@playwright/test'

/** Measures default opaque text/surfaces using the W3C sRGB contrast formula. */
export async function expectTextContrast(target, selectors) {
  const contrasts = await target.evaluate((element, { foreground, backgrounds }) => {
    const luminance = color => {
      const channels = color.match(/[\d.]+/g).slice(0, 3).map(value => {
        const normalized = Number(value) / 255

        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
      })

      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
    }
    const text = element.querySelector(foreground)
    const foregroundLuminance = luminance(getComputedStyle(text).color)

    return backgrounds.map(selector => {
      let surface = selector === ':scope' ? element : element.querySelector(selector)
      let color = getComputedStyle(surface).backgroundColor
      while (color === 'rgba(0, 0, 0, 0)' && surface.parentElement) {
        surface = surface.parentElement
        color = getComputedStyle(surface).backgroundColor
      }
      const backgroundLuminance = luminance(color)

      return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
        / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
    })
  }, selectors)
  for (const contrast of contrasts) {
    expect(contrast).toBeGreaterThanOrEqual(4.5)
  }
}
