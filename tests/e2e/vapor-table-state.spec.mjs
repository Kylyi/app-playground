import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics, createObservedContext } from './renderer-diagnostics.mjs'

assertRendererDiagnostics(test)

test('Table state in Vapor preserves legacy keys and isolates local instances', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' || /hydration/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  // Card rows intentionally size headers to their labels. Use the desktop column layout.
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded-2.3-table-state')) {
      return
    }
    sessionStorage.setItem('seeded-2.3-table-state', 'true')
    const state = { columns: [], layouts: [], metaRaw: null, queryBuilder: [], search: '', queryParams: '' }
    localStorage.setItem('LegacyTablePage', JSON.stringify({ ...state, customData: { count: 7 } }))
    localStorage.setItem('LegacyOrdersTableOwner', JSON.stringify({
      ...state,
      columns: [{ field: 'id', width: '173px' }],
      customData: { count: 15 },
    }))
  })
  await page.goto('/cs-CZ/vapor-table-state')
  await expect(page.getByTestId('saved')).toHaveAttribute('data-ready', 'true')
  const implicit = page.getByTestId('implicit-table')
  await expect(implicit.getByTestId('saved-count')).toHaveText('15')
  await expect(implicit.locator('.th[data-column="id"]')).toHaveCSS('width', '173px')
  await implicit.getByRole('button', { name: 'Save implicit preference' }).click()
  await expect(implicit.getByTestId('saved-count')).toHaveText('16')
  await expect(page.getByTestId('empty-table').locator('.table-empty')).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('LegacyTableStatePage'))).toBeTruthy()
  const value = label => page.getByTestId(label).getByTestId('value')
  await expect(value('saved')).toHaveText('7')
  for (const label of ['saved', 'other', 'local', 'disabled']) {
    await page.getByTestId(label).getByRole('button').click()
  }
  await expect(value('saved')).toHaveText('8')
  for (const label of ['other', 'local', 'disabled']) {
    await expect(value(label)).toHaveText('1')
  }
  const localIds = await Promise.all(['local', 'disabled'].map(label =>
    page.getByTestId(label).getByTestId('identity').textContent()))
  expect(new Set(localIds).size).toBe(2)
  for (const remount of [() => page.getByTestId('remount').click(), () => page.reload()]) {
    await remount()
    await expect(implicit.getByTestId('saved-count')).toHaveText('16')
    await expect(value('saved')).toHaveText('8')
    await expect(value('other')).toHaveText('1')
    await expect(value('local')).toHaveText('0')
    await expect(value('disabled')).toHaveText('0')
  }
  expect(await page.evaluate(ids => ids.map(id => localStorage.getItem(id)), localIds)).toEqual([null, null])
  expect(errors).toEqual([])
})

test('Table store owners render on the server without JavaScript', async ({ browser, baseURL }) => {
  const context = await createObservedContext(browser, { javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    const response = await page.goto(new URL('/vapor-table-state', baseURL).href)
    expect(response.status()).toBe(200)
    for (const label of ['saved', 'other', 'local', 'disabled']) {
      await expect(page.getByTestId(label)).toHaveAttribute('data-ready', 'false')
      await expect(page.getByTestId(label).getByRole('button')).toBeVisible()
    }
  } finally {
    await context.close()
  }
})
