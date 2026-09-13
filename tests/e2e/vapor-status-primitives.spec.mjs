import { expect, test } from '@playwright/test'

test('status primitives preserve loading and dismiss states across remount', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component/i.test(message.text())) {
      problems.push(message.text())
    }
  })

  await page.goto('/cs-CZ/vapor-status-primitives')
  await expect(page.getByTestId('status-primitives-example')).toHaveAttribute('data-ready', 'true')
  await expect(page.getByTestId('status-page-loading')).toBeVisible()
  await expect(page.getByTestId('status-table-loading')).toBeVisible()
  await expect(page.getByTestId('status-table-layout')).toHaveText('Table Layout')
  await expect(page.getByTestId('status-table-row-group')).toHaveText('Table group row')
  await expect(page.getByTestId('status-tree-loading')).toBeVisible()
  await expect(page.getByTestId('status-tree-empty')).toHaveText('Žádná data')

  await page.getByTestId('status-too-many-rows').locator('button').click()
  await expect(page.getByTestId('status-too-many-rows')).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
  await expect(page.getByTestId('status-too-many-rows')).toBeVisible()
  await expect(page.getByTestId('status-tree-loading')).toBeVisible()
  await expect(page.getByTestId('status-tree-empty')).toHaveText('Žádná data')
  expect(problems).toEqual([])
})

test('status primitives and localized navigation render during SSR', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-status-primitives')
    await expect(page.getByTestId('status-page-loading')).toBeVisible()
    await expect(page.getByTestId('status-table-loading')).toBeVisible()
    await expect(page.getByTestId('status-too-many-rows')).toBeVisible()
    await expect(page.getByTestId('status-tree-loading')).toBeVisible()
    await expect(page.getByTestId('status-tree-empty')).toHaveText('Žádná data')
    await expect(page.getByRole('link', { name: 'Stavové prvky · Vapor', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-status-primitives')
  } finally {
    await context.close()
  }
})
