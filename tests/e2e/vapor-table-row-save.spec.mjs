import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics, createObservedContext } from './renderer-diagnostics.mjs'

assertRendererDiagnostics(test)

test('async row saves lock actions, retain rejected drafts and allow retry', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (/hydration.*mismatch/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-table-edit?mode=row-save')
  await expect(page.getByTestId('table-edit')).toHaveAttribute('data-ready', 'true')
  const rows = page.getByTestId('edited-rows')
  await page.locator('[data-row-edit="1"]').click()
  const input = page.locator('.td[data-key="1"][data-field="name"] input')
  await input.fill('Saved draft')
  await expect(rows).toContainText('Položka 1')
  await page.getByRole('button', { name: 'Toggle save rejection', exact: true }).click()
  await page.getByRole('button', { name: 'Save row', exact: true }).click()
  await expect(page.getByTestId('row-save-state')).toHaveText('pending')
  await expect(page.getByRole('button', { name: 'Save row', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Cancel row', exact: true })).toBeDisabled()
  await expect(page.locator('[data-row-edit="2"]')).toBeDisabled()
  await page.getByRole('button', { name: 'Resolve save', exact: true }).click()
  await expect(page.getByTestId('row-save-error')).toHaveText('Save rejected')
  await expect(input).toHaveValue('Saved draft')
  await expect(rows).toContainText('Položka 1')

  await page.getByRole('button', { name: 'Toggle save rejection', exact: true }).click()
  await page.getByRole('button', { name: 'Save row', exact: true }).click()
  await page.getByRole('button', { name: 'Resolve save', exact: true }).click()
  await expect(page.getByTestId('row-save-state')).toHaveText('saved')
  await expect(input).toHaveCount(0)
  await expect(rows).toContainText('Saved draft')
  await expect(page.locator('[data-row-edit="2"]')).toBeEnabled()
  await expect(page.getByRole('link', { name: 'Table · asynchronní uložení řádku', exact: true }))
    .toHaveAttribute('href', '/cs-CZ/vapor-table-edit?mode=row-save')
  expect(errors).toEqual([])
})

test('async row editor renders its data and localized navigation without JavaScript', async ({ browser, baseURL }) => {
  const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-table-edit?mode=row-save')
    await expect(page.locator('[data-row-edit="1"]')).toBeVisible()
    await expect(page.getByTestId('row-save-state')).toHaveText('idle')
    await expect(page.getByTestId('edited-rows')).toContainText('Položka 1')
    await expect(page.getByRole('link', { name: 'Table · asynchronní uložení řádku', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-table-edit?mode=row-save')
  } finally {
    await context.close()
  }
})
