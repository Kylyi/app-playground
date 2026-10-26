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

async function open(page, path, testId) {
  const [response, manifest] = await Promise.all([
    page.goto(`/cs-CZ/${path}`),
    page.waitForResponse(response => response.url().includes('/builds/meta/')),
  ])
  expect(response.status()).toBe(200)
  expect(manifest.ok()).toBe(true)
  expect(await manifest.finished()).toBeNull()
  const target = page.getByTestId(testId)
  await expect(target).toHaveAttribute('data-ready', 'true')

  return target
}

test('open dialog, selector search and tooltip retain their owner content', async ({ page }, testInfo) => {
  await open(page, 'vapor-programmatic-dialog', 'programmatic-dialog')
  await page.getByRole('button', { name: 'Open declarative dialog', exact: true }).click()
  const dialog = page.locator('.dialog__wrapper')
  await expect(dialog.getByTestId('injected-dialog-content')).toHaveText('Owner context')
  // The fixture changes the provider without an outside press closing the dialog.
  await page.getByRole('button', { name: 'Update context', exact: true }).evaluate(element => element.click())
  await expect(dialog.getByTestId('injected-dialog-content')).toHaveText('Updated owner context')
  await captureState({ page, testInfo, target: dialog, state: 'dialog-owner-updated', families: ['Dialog'] })
  await dialog.getByRole('button', { name: 'Close through slot', exact: true }).click()
  await expect(dialog).toHaveCount(0)

  await open(page, 'selector-vapor', 'selector-fixture')
  const control = page.getByTestId('selector').locator('.control')
  await control.click()
  const menu = page.locator('.selector-menu:visible')
  const input = menu.getByRole('textbox')
  await input.fill('Gamma')
  await expect(page.getByTestId('search')).toHaveText('Gamma')
  await expect(menu.getByText('Gamma', { exact: true })).toBeVisible()
  await captureState({ page, testInfo, target: menu, state: 'selector-search-open', families: ['Selector', 'Inputs', 'Menu', 'Dialog'] })
  await menu.getByText('Gamma', { exact: true }).click()
  await expect(page.getByTestId('value')).toHaveText(JSON.stringify({ id: 3, label: 'Gamma' }))
  await expect(menu).toHaveCount(0)

  await open(page, 'shared-tooltip', 'shared-tooltip-page')
  await page.getByTestId('tooltip-trigger-b').hover()
  const bubble = page.getByTestId('shared-bubble')
  await expect(bubble).toContainText('Beta content')
  await expect(bubble).toContainText('Author context preserved')
  await captureState({ page, testInfo, target: bubble, state: 'tooltip-open', families: ['Tooltip'] })
  await page.getByRole('button', { name: 'Update content', exact: true }).click()
  await expect(bubble).toHaveCount(0)
})

test('nested form errors, drawers and action confirmations remain readable', async ({ page }, testInfo) => {
  await open(page, 'vapor-form', 'vapor-form-page')
  const form = page.getByTestId('form-base')
  await form.getByRole('button', { name: 'Uložit', exact: true }).click()
  for (const name of ['name', 'city', 'zip']) {
    const field = form.getByTestId(`${name}-field`)
    await expect(field.locator('.has-error')).toHaveCount(1)
    await expect(field.locator('span.align-middle')).toBeVisible()
    await expect(field.locator('span.align-middle')).not.toHaveText('')
  }
  await expect(page.getByTestId('form-billing').locator('.has-error')).toHaveCount(0)
  await captureState({ page, testInfo, target: form, state: 'form-nested-errors', families: ['Form', 'Inputs'] })

  const actions = await open(page, 'vapor-action-primitives', 'action-primitives-example')
  const drawer = page.getByTestId('action-drawer-panel')
  await expect(drawer).toHaveClass(/(?:^|\s)is-open(?:\s|$)/)
  await expect(page.getByTestId('action-page-drawer-content')).toHaveText('Page drawer content')
  const pageDrawer = page.getByTestId('action-page-drawer')
  const shell = page.getByTestId('action-page-shell')
  const drawerBounds = await pageDrawer.boundingBox()
  const shellBounds = await shell.boundingBox()
  expect(drawerBounds.x).toBeGreaterThanOrEqual(shellBounds.x)
  expect(drawerBounds.y).toBeGreaterThanOrEqual(shellBounds.y)
  expect(drawerBounds.x + drawerBounds.width).toBeLessThanOrEqual(shellBounds.x + shellBounds.width + 1)
  expect(drawerBounds.y + drawerBounds.height).toBeLessThanOrEqual(shellBounds.y + shellBounds.height + 1)
  await captureState({ page, testInfo, target: actions, state: 'drawers-open', families: ['Drawer', 'Page', 'Crud'] })
  await drawer.locator('.drawer-title').getByRole('button').click()
  await expect(drawer).not.toHaveClass(/(?:^|\s)is-open(?:\s|$)/)
  await pageDrawer.locator('.page-drawer-bottom').getByRole('button').click()
  await expect(pageDrawer.getByLabel('Mini page drawer')).toBeVisible()
  await captureState({ page, testInfo, target: pageDrawer, state: 'drawer-mini', families: ['Page'] })
  await page.getByRole('button', { name: 'Archive record', exact: true }).click()
  const confirmation = page.locator('.menu, .dialog__wrapper').filter({ has: page.locator('[data-cy="confirm-delete"]') })
  await expect(confirmation).toBeVisible()
  await captureState({ page, testInfo, target: confirmation, state: 'crud-confirmation-open', families: ['Crud', 'Menu'] })
  await confirmation.locator('[data-cy="confirm-delete"]').click()
  await expect(page.getByTestId('action-counts')).toHaveText('0:1:0')
  await expect(confirmation).toHaveCount(0)
  await page.getByRole('button', { name: 'Open table options', exact: true }).click()
  const options = page.locator('.dialog__wrapper')
  await expect(options).toContainText('Automaticky ukládat rozložení tabulky')
  await captureState({ page, testInfo, target: options, state: 'table-options-open', families: ['Table', 'Dialog', 'Checkbox'] })
  await page.keyboard.press('Escape')
  await expect(options).toHaveCount(0)
})

test('Pivot filter and nested comparator picker stay usable while rows change', async ({ page }, testInfo) => {
  await open(page, 'vapor-pivot-filters', 'pivot-filters-example')
  const pivot = page.getByTestId('filters-pivot')
  const rows = pivot.locator('.pivot-content__rows .pivot-row-item:not(.is-grand-total)')
  await expect(rows).toContainText(['Alpha', 'Beta', 'Gamma'])
  await pivot.locator('[data-pivot-row="team"] .pivot-filter-btn').click()
  const menu = page.locator('.menu, .dialog__wrapper').filter({ has: page.locator('.pivot-filter-menu') })
  await expect(menu).toBeVisible()
  await menu.locator('[data-cy="qb-item__content-value"] input').fill('Alpha')
  await expect(rows).toHaveCount(1)
  await expect(rows).toContainText(['Alpha'])
  await captureState({ page, testInfo, target: menu, state: 'pivot-value-filter-open', families: ['Pivot', 'QueryBuilder', 'Inputs', 'Menu'] })
  await menu.locator('[data-cy="comparator"] .control').click()
  const comparator = page.locator('.selector-menu:visible')
  await expect(comparator.getByText('Nerovná se', { exact: true })).toBeVisible()
  await captureState({ page, testInfo, target: comparator, state: 'pivot-comparator-open', families: ['Pivot', 'Selector', 'Menu', 'Dialog'] })
  await comparator.getByText('Nerovná se', { exact: true }).click()
  await expect(rows).toHaveCount(2)
  await expect(rows).toContainText(['Beta', 'Gamma'])
  await expect(menu).toBeVisible()
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).evaluate(element => element.click())
  await expect(page.locator('.menu, .dialog__wrapper, .selector-menu:visible')).toHaveCount(0)
})
