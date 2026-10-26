import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics, createObservedContext } from './renderer-diagnostics.mjs'

assertRendererDiagnostics(test)

async function open(page, mode = 'keyboard') {
  const manifest = page.waitForResponse(response => response.url().includes('/builds/meta/'))
  await page.goto(`/cs-CZ/vapor-tabs?mode=${mode}`)
  expect(await (await manifest).finished()).toBeNull()
  await expect(page.getByTestId('accessible-tabs')).toHaveAttribute('data-ready', 'true')

  return page.getByTestId('keyboard-tabs')
}

test('manual tabs have one entry point, skip disabled tabs and activate with Enter or Space', async ({ page }) => {
  const group = await open(page)
  const list = group.getByRole('tablist', { name: 'Project sections' })
  const alpha = list.getByRole('tab', { name: 'Alpha', exact: true })
  const gamma = list.getByRole('tab', { name: 'Gamma', exact: true })
  const delta = list.getByRole('tab', { name: 'Delta', exact: true })
  await expect(list.getByRole('tab', { name: 'Beta', exact: true })).toBeDisabled()
  await expect(list.locator('[role="tab"][tabindex="0"]')).toHaveCount(1)
  await page.getByTestId('before-tabs').focus()
  await page.keyboard.press('Tab')
  await expect(alpha).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(gamma).toBeFocused()
  await expect(alpha).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByTestId('accessible-selection')).toHaveText('alpha')
  await page.keyboard.press('Enter')
  await expect(gamma).toHaveAttribute('aria-selected', 'true')
  await expect(group.getByRole('tabpanel', { name: 'Gamma', exact: true })).toBeVisible()
  await page.keyboard.press('End')
  await expect(delta).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.getByTestId('accessible-selection')).toHaveText('delta')
  await page.keyboard.press('ArrowRight')
  await expect(alpha).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(delta).toBeFocused()
  await page.keyboard.press('Home')
  await expect(alpha).toBeFocused()
  await alpha.evaluate(element => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    element.dispatchEvent(event)
    element.dataset.downPrevented = String(event.defaultPrevented)
  })
  await expect(alpha).toHaveAttribute('data-down-prevented', 'false')
})

test('Tab exits to the selected panel and Shift+Tab re-enters on the selected tab', async ({ page }) => {
  const group = await open(page)
  const alpha = group.getByRole('tab', { name: 'Alpha', exact: true })
  await alpha.focus()
  await page.keyboard.press('ArrowRight')
  await expect(group.getByRole('tab', { name: 'Gamma', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(group.getByRole('tabpanel', { name: 'Alpha', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByTestId('action-alpha')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByTestId('after-tabs')).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(alpha).toBeFocused()
  await expect(group.locator('[role="tab"][tabindex="0"]')).toHaveCount(1)
})

test('automatic tabs select on arrow focus and reveal overflowing targets', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const group = await open(page, 'automatic')
  await group.getByRole('tab', { name: 'Alpha', exact: true }).focus()
  await page.keyboard.press('End')
  const delta = group.getByRole('tab', { name: 'Delta', exact: true })
  await expect(delta).toBeFocused()
  await expect(delta).toHaveAttribute('aria-selected', 'true')
  await expect(group.getByRole('tabpanel', { name: 'Delta', exact: true })).toBeVisible()
  await expect.poll(() => delta.evaluate(element => {
    const box = element.getBoundingClientRect()
    const viewport = element.closest('.content').getBoundingClientRect()

    return box.left >= viewport.left - 1 && box.right <= viewport.right + 1
  })).toBe(true)
  await page.keyboard.press('Home')
  await expect(page.getByTestId('accessible-selection')).toHaveText('alpha')
})

test('tab IDs survive label/order updates, and deletion recovers selection and focus', async ({ page }) => {
  const group = await open(page)
  const alphaId = await group.getByRole('tab', { name: 'Alpha', exact: true }).getAttribute('id')
  await page.getByRole('button', { name: 'Rename accessible Alpha', exact: true }).click()
  await expect(group.getByRole('tab', { name: 'Renamed Alpha', exact: true })).toHaveAttribute('id', alphaId)
  await page.getByRole('button', { name: 'Reverse accessible tabs', exact: true }).click()
  await expect(group.getByRole('tab')).toHaveText(['Delta', 'Gamma', 'Beta', 'Renamed Alpha'])
  const gamma = group.getByRole('tab', { name: 'Gamma', exact: true })
  await gamma.click()
  await page.keyboard.press('Delete')
  await expect(gamma).toHaveCount(0)
  // Beta is disabled; the following enabled tab in current declaration order wins.
  await expect(page.getByTestId('accessible-selection')).toHaveText('alpha')
  await expect(group.getByRole('tab', { name: 'Renamed Alpha', exact: true })).toBeFocused()
  await page.getByRole('button', { name: 'Toggle Alpha disabled', exact: true }).evaluate(element => element.click())
  await expect(group.getByRole('tab', { name: 'Delta', exact: true })).toBeFocused()
  await expect(group.locator('[role="tab"][tabindex="0"]')).toHaveCount(1)
  await page.getByRole('button', { name: 'Toggle accessible owner', exact: true }).click()
  await expect(group).toHaveCount(0)
  await expect(page.getByTestId('accessible-selection')).toHaveText('alpha')
  await page.getByRole('button', { name: 'Toggle accessible owner', exact: true }).click()
  await expect(group.getByRole('tabpanel', { name: 'Renamed Alpha', exact: true })).toBeVisible()
})

test('custom label slots share keyboard behavior, unique IDs and complete ARIA relationships', async ({ page }) => {
  await open(page)
  const custom = page.getByTestId('custom-label-tabs')
  await custom.getByRole('tab', { name: 'Custom Alpha', exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(custom.getByRole('tab', { name: 'Gamma', exact: true })).toBeFocused()
  await page.keyboard.press('Space')
  await expect(custom.getByRole('tabpanel', { name: 'Gamma', exact: true })).toBeVisible()
  const relationships = await page.getByTestId('accessible-tabs').evaluate(root => {
    const tabs = [...root.querySelectorAll('[role="tab"]')]

    return tabs.map(tab => {
      const panel = root.ownerDocument.getElementById(tab.getAttribute('aria-controls'))

      return { id: tab.id, valid: panel?.getAttribute('role') === 'tabpanel' && panel.getAttribute('aria-labelledby') === tab.id }
    })
  })
  expect(new Set(relationships.map(item => item.id)).size).toBe(relationships.length)
  expect(relationships.every(item => item.valid)).toBe(true)
  const result = await new AxeBuilder({ page }).include('[data-testid="accessible-tabs"]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect(result.violations).toEqual([])
})

test('server tab markup has linked panels, bounded content and localized navigation', async ({ browser, baseURL, page }) => {
  const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false })
  try {
    const server = await context.newPage()
    for (const [mode, label] of [['keyboard', 'Tabs · klávesnice a přístupnost'], ['automatic', 'Tabs · automatická aktivace']]) {
      const path = `/cs-CZ/vapor-tabs?mode=${mode}`
      await server.goto(path)
      const group = server.getByTestId('keyboard-tabs')
      await expect(group.getByRole('tabpanel', { name: 'Alpha', exact: true })).toContainText('alpha panel introduction')
      await expect(group.getByRole('tabpanel', { includeHidden: true })).toHaveCount(4)
      await expect(group.getByTestId('action-gamma')).toHaveCount(0)
      const id = await group.getByRole('tab', { name: 'Alpha', exact: true }).getAttribute('id')
      await expect(group.getByRole('tabpanel', { name: 'Alpha', exact: true })).toHaveAttribute('aria-labelledby', id)
      await expect(server.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', path)
      const hydrated = await open(page, mode)
      await expect(hydrated.getByRole('tab', { name: 'Alpha', exact: true })).toHaveAttribute('id', id)
    }
  } finally {
    await context.close()
  }
})
