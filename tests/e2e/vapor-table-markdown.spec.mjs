import { expect, test } from '@playwright/test'

test('Comark renders cell values and table remeasures changed content', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (/hydration.*mismatch/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-table-markdown')
  await expect(page.getByTestId('table-markdown')).toHaveAttribute('data-ready', 'true')
  await expect(page.locator('.table-loading')).toHaveCount(0)
  const cell = id => page.locator(`.td[data-key="${id}"][data-field="description"]`)
  await expect(cell(0).locator('strong')).toHaveText('tučným textem')
  await expect(cell(1).locator('li')).toHaveCount(3)
  await expect(cell(2).locator('blockquote')).toContainText('Poznámka k implementaci')
  await expect(cell(3).locator('pre')).toContainText('"delay": 0')
  const row = page.locator('.content-row[data-key="0"]')
  const initialHeight = (await row.boundingBox()).height
  await page.getByRole('button', { name: 'Rozšířit popisy' }).click()
  await expect(cell(0)).toContainText('Doplnění:')
  await expect.poll(async () => (await row.boundingBox()).height).toBeGreaterThan(initialHeight)
  async function aligned() {
    return page.locator('.content-row').evaluateAll(rows => rows.length > 1 && rows.slice(1).every((row, index) =>
      Math.abs(row.getBoundingClientRect().top - rows[index].getBoundingClientRect().bottom) < 1))
  }
  await expect.poll(aligned).toBe(true)
  await page.getByRole('button', { name: 'Zkrátit popisy' }).click()
  await expect.poll(async () => (await row.boundingBox()).height).toBe(initialHeight)
  await page.getByRole('button', { name: 'Na záznam 101' }).click()
  await expect(cell(100).locator('strong')).toHaveText('tučným textem')
  await expect(cell(0)).toHaveCount(0)
  await expect.poll(aligned).toBe(true)
  await page.getByRole('button', { name: 'Na začátek' }).click()
  await expect(cell(0).locator('strong')).toBeVisible()
  expect(errors).toEqual([])
})

test('table cell Markdown is already rendered in SSR HTML', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    const response = await page.goto('/cs-CZ/vapor-table-markdown')
    expect(response.status()).toBe(200)
    await expect(page.locator('.content-row')).toHaveCount(6)
    await expect(page.locator('.td[data-key="0"][data-field="description"] strong')).toHaveText('tučným textem')
    await expect(page.locator('.td[data-key="1"][data-field="description"] li')).toHaveCount(3)
    await expect(page.getByRole('link', { name: 'Table · Markdown v buňce', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-table-markdown')
  } finally {
    await context.close()
  }
})
