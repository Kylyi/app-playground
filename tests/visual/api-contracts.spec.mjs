import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics } from '../e2e/renderer-diagnostics.mjs'
import { captureState } from './capture-state.mjs'

assertRendererDiagnostics(test)
test.beforeEach(async ({ context, baseURL }, testInfo) => {
  await context.addCookies([{ name: 'theme', value: testInfo.project.metadata.theme, url: baseURL }])
})
test.afterEach(async ({ page }, testInfo) => {
  await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${testInfo.project.metadata.theme}\\b`))
})

test('accessible tabs keep navigation above panels and expose focused overflow targets', async ({ page }, testInfo) => {
  await page.goto('/cs-CZ/vapor-tabs?mode=keyboard')
  const target = page.getByTestId('accessible-tabs')
  await expect(target).toHaveAttribute('data-ready', 'true')
  const group = page.getByTestId('keyboard-tabs')
  const list = group.getByRole('tablist')
  const panel = group.getByRole('tabpanel', { name: 'Alpha', exact: true })
  expect(await list.evaluate(element => element.getBoundingClientRect().bottom))
    .toBeLessThanOrEqual(await panel.evaluate(element => element.getBoundingClientRect().top))
  await group.getByRole('tab', { name: 'Alpha', exact: true }).focus()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await expect(group.getByRole('tabpanel', { name: 'Delta', exact: true })).toBeVisible()
  await expect(group.getByRole('tab', { name: 'Delta', exact: true })).toBeFocused()
  await captureState({ page, testInfo, target: group, state: 'tabs-overflow-selected', families: ['Tabs', 'HorizontalScroller'] })
  await page.keyboard.press('Tab')
  await expect(group.getByRole('tabpanel', { name: 'Delta', exact: true })).toBeFocused()
  await captureState({ page, testInfo, target: group, state: 'tabs-panel-focused', families: ['Tabs'] })
})

test('sticky vertical scroller and typed Tree keep bounded rows aligned after API changes', async ({ page }, testInfo) => {
  await page.goto('/cs-CZ/vapor-scroller-contracts?mode=sticky')
  await expect(page.getByTestId('scroller-contracts')).toHaveAttribute('data-ready', 'true')
  const vertical = page.getByTestId('vertical-contract')
  await page.getByRole('button', { name: 'Contract scroll 60', exact: true }).click()
  await expect(vertical.locator('[data-index="60"]')).toHaveClass(/is-sticky-active/)
  await captureState({ page, testInfo, target: vertical, state: 'vertical-sticky-60', families: ['VirtualScroller'] })
  await page.getByRole('button', { name: 'Contract clear', exact: true }).click()
  await expect(vertical.locator('.content-row')).toHaveCount(0)
  await page.getByRole('button', { name: 'Contract rerender', exact: true }).click()
  await expect(vertical.locator('[data-index="60"]')).toBeVisible()
  const tree = page.getByTestId('typed-tree')
  await tree.locator('.virtual-scroll').evaluate(element => element.scrollTop = 36 * 60)
  await expect(tree.locator('.tree-node[data-id="60"]')).toHaveText('Typed node 60')
  await captureState({ page, testInfo, target: tree, state: 'tree-custom-ids-60', families: ['Tree', 'VirtualScroller'] })
})
