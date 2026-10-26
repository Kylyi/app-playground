import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics } from '../e2e/renderer-diagnostics.mjs'
import { captureState } from './capture-state.mjs'

assertRendererDiagnostics(test)
test.beforeEach(async ({ context, baseURL }, testInfo) => {
  await context.addCookies([{ name: 'theme', value: testInfo.project.metadata.theme, url: baseURL }])
})

test('consumer editor and custom row contracts remain usable across theme and viewport', async ({ page }, testInfo) => {
  await page.goto('/cs-CZ/vapor-consumer-contracts?mode=registered')
  const target = page.getByTestId('consumer-contracts')
  await expect(target).toHaveAttribute('data-ready', 'true')
  await page.getByRole('button', { name: 'Focus consumer editor', exact: true }).click()
  await expect(target.locator('input')).toBeFocused()
  await expect(target.locator('article[data-consumer-row]')).toHaveCount(2)
  await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${testInfo.project.metadata.theme}\\b`))
  await captureState({ page, testInfo, target, state: 'registered-editor-and-rows', families: ['List', 'Inputs'] })
})

test('Collapse adapts its content and remains bounded after dynamic resizing', async ({ page }, testInfo) => {
  await page.goto('/cs-CZ/vapor-collapse-contracts')
  const target = page.getByTestId('collapse-contracts')
  await expect(target).toHaveAttribute('data-ready', 'true')
  await page.getByRole('button', { name: 'Grow collapse content', exact: true }).click()
  await page.getByRole('button', { name: 'Cap collapse height', exact: true }).click()
  const content = page.getByTestId('consumer-collapse').locator('.collapse__content')
  await expect(content).toHaveCSS('max-height', '80px')
  await expect(content).toHaveCSS('transition-property', 'height')
  await expect.poll(() => content.evaluate(el => Math.round(el.getBoundingClientRect().height)))
    .toBeLessThanOrEqual(82)
  await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${testInfo.project.metadata.theme}\\b`))
  await captureState({ page, testInfo, target, state: 'collapse-capped-content', families: ['Collapse'] })
})
