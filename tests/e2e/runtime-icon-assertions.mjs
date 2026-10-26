import { expect } from '@playwright/test'
import sharp from 'sharp'

/** Native paint verification also works with JavaScript disabled in Firefox. */
export async function expectPaintedColorIcon(icon) {
  const { data, info } = await sharp(await icon.screenshot()).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const pixel = fraction => {
    const index = (Math.floor(info.height / 2) * info.width + Math.floor(info.width * fraction)) * info.channels

    return Array.from(data.subarray(index, index + 4))
  }
  expect(pixel(0.25)).toEqual([230, 57, 70, 255])
  expect(pixel(0.75)).toEqual([21, 101, 192, 255])
}

/** Check a real loaded SVG and browser styles, not only an icon class. */
export async function expectRenderedIcon(icon, options = {}) {
  await expect(icon).toHaveAttribute('data-icon-status', 'ready')
  if (options.name) {
    await expect(icon).toHaveAttribute('data-icon', options.name)
  }
  await expect(icon).toHaveAttribute('data-icon-mode', options.mode ?? 'mask')
  const rendered = await icon.evaluate(async element => {
    const style = getComputedStyle(element)
    const mode = element.dataset.iconMode
    const imageValue = mode === 'mask' ? style.maskImage || style.webkitMaskImage : style.backgroundImage
    const url = imageValue.slice(4, -1).replace(/^['"]|['"]$/g, '')
    const image = new Image()
    image.src = url
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = 24
    canvas.height = 24
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, 24, 24)
    const left = Array.from(context.getImageData(4, 12, 1, 1).data)
    const right = Array.from(context.getImageData(20, 12, 1, 1).data)

    return { imageValue, color: style.color, backgroundColor: style.backgroundColor, width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height, left, right }
  })
  expect(rendered.imageValue).not.toBe('none')
  expect(rendered.width).toBeGreaterThan(0)
  expect(rendered.height).toBeGreaterThan(0)
  if (options.colors) {
    expect(rendered.left).toEqual([230, 57, 70, 255])
    expect(rendered.right).toEqual([21, 101, 192, 255])
  } else if (options.mode !== 'background') {
    expect(rendered.backgroundColor).toBe(rendered.color)
  }

  return rendered
}
