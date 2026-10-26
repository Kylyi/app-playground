import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics, createObservedContext } from './renderer-diagnostics.mjs'

assertRendererDiagnostics(test)

test('legacy VDOM consumers retain controlled/local models and reset aliases', async ({ page }) => {
  await page.goto('/cs-CZ/vdom-consumer-contracts')
  await expect(page.getByTestId('legacy-consumer-contracts')).toHaveAttribute('data-ready', 'true')
  const controlled = page.getByTestId('legacy-controlled').locator('input')
  const local = page.getByTestId('legacy-local').locator('input')
  await expect(controlled).toHaveValue('Controlled legacy value')
  await expect(local).toHaveValue('Local legacy value')
  await controlled.fill('Legacy edit')
  await expect(page.getByTestId('legacy-value')).toHaveText('Legacy edit')
  await expect(page.getByTestId('legacy-updates')).toHaveText('1')
  await local.fill('Local edit')
  await expect(page.getByTestId('legacy-value')).toHaveText('Legacy edit')
  await page.getByRole('button', { name: 'Replace legacy value', exact: true }).click()
  await expect(controlled).toHaveValue('Legacy parent replacement')
  await page.getByRole('button', { name: 'Toggle legacy consumer', exact: true }).click()
  await expect(controlled).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle legacy consumer', exact: true }).click()
  await expect(controlled).toHaveValue('Legacy parent replacement')
  await expect(local).toHaveValue('Local legacy value')
  const draft = page.getByRole('textbox', { name: 'Reset draft', exact: true })
  await draft.fill('Committed origin')
  await page.getByRole('button', { name: 'Commit reset draft', exact: true }).click()
  await expect(page.getByTestId('reset-origin')).toHaveText('Committed origin')
  await expect(page.getByTestId('reset-updates')).toHaveText('1')
  await draft.fill('Discarded edit')
  await page.getByRole('button', { name: 'Restore reset draft', exact: true }).click()
  await expect(draft).toHaveValue('Committed origin')
  await expect(page.getByTestId('reset-updates')).toHaveText('1')
})

test('legacy consumers render deterministic server HTML and localized navigation', async ({ browser, baseURL }) => {
  const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vdom-consumer-contracts')
    await expect(page.getByTestId('legacy-controlled').locator('input')).toHaveValue('Controlled legacy value')
    await expect(page.getByTestId('legacy-local').locator('input')).toHaveValue('Local legacy value')
    await expect(page.getByTestId('reset-origin')).toHaveText('Origin value')
    await expect(page.getByTestId('legacy-updates')).toHaveText('0')
    await expect(page.getByRole('link', { name: 'Konzumenti · legacy API', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vdom-consumer-contracts')
  } finally {
    await context.close()
  }
})
