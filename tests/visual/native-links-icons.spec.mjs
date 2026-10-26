import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics } from '../e2e/renderer-diagnostics.mjs'
import { expectPaintedColorIcon, expectRenderedIcon } from '../e2e/runtime-icon-assertions.mjs'
import { captureState } from './capture-state.mjs'

assertRendererDiagnostics(test)
test.beforeEach(async ({ context, baseURL }, testInfo) => {
  await context.addCookies([{ name: 'theme', value: testInfo.project.metadata.theme, url: baseURL }])
})

test('native link surfaces and table row focus retain readable labels', async ({ page }, testInfo) => {
  await page.goto('/cs-CZ/vapor-native-links?mode=card')
  await expect(page.getByTestId('native-links')).toHaveAttribute('data-ready', 'true')
  const contrast = await page.getByTestId('current-link').evaluate(element => {
    const context = document.createElement('canvas').getContext('2d')
    const color = value => {
      context.clearRect(0, 0, 1, 1)
      context.fillStyle = value
      context.fillRect(0, 0, 1, 1)

      return Array.from(context.getImageData(0, 0, 1, 1).data)
    }
    const luminance = rgb => rgb.slice(0, 3).map(channel => {
      const value = channel / 255

      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    }).reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0)
    let background = element.parentElement
    while (background && color(getComputedStyle(background).backgroundColor)[3] === 0) {
      background = background.parentElement
    }
    const foreground = luminance(color(getComputedStyle(element).color))
    const backdrop = luminance(color(getComputedStyle(background).backgroundColor))

    return (Math.max(foreground, backdrop) + 0.05) / (Math.min(foreground, backdrop) + 0.05)
  })
  expect(contrast).toBeGreaterThanOrEqual(4.5)
  await captureState({ page, testInfo, target: page.getByTestId('native-links'), state: 'native-link-surfaces', families: ['Link', 'Chip', 'Card', 'Button', 'Selector', 'Table', 'FilePreview'] })
  const row = page.getByTestId('mixed-link-table').locator('.row-link')
  const cell = page.getByTestId('mixed-link-table').locator('.td a')
  await cell.focus()
  // Safari's default keyboard mode uses Option-Tab to include anchors.
  await page.keyboard.press(testInfo.project.metadata.browser === 'webkit' ? 'Alt+Shift+Tab' : 'Shift+Tab')
  await expect(row).toBeFocused()
  await expect.poll(() => row.evaluate(element => ({
    visible: element.matches(':focus-visible'),
    outline: getComputedStyle(element.parentElement).outlineWidth,
  }))).toEqual({ visible: true, outline: '2px' })
  await captureState({ page, testInfo, target: page.getByTestId('mixed-link-table'), state: 'native-row-link-focus', families: ['Link', 'Table'] })
})

test('native runtime icons show actual monochrome and multicolor artwork', async ({ page }, testInfo) => {
  await page.goto('/cs-CZ/vapor-runtime-icons')
  await expect(page.getByTestId('runtime-icons')).toHaveAttribute('data-ready', 'true')
  await expectRenderedIcon(page.getByTestId('runtime-mask'))
  await expectRenderedIcon(page.getByTestId('runtime-background'), { mode: 'background', colors: true })
  await expectPaintedColorIcon(page.getByTestId('runtime-background'))
  await captureState({ page, testInfo, target: page.getByTestId('runtime-icons'), state: 'native-runtime-icons', families: ['Icon', 'Button', 'Chip'] })
})
