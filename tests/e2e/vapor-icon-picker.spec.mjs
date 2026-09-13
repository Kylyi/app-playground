import { expect, test } from '@playwright/test'

test('IconPicker restores slots, searches and prevents readonly selection', async ({ page }) => {
  const problems = []
  const queries = []
  let delayedRequest
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component/i.test(message.text())) {
      problems.push(message.text())
    }
  })
  await page.route('https://api.iconify.design/search?*', async route => {
    const query = new URL(route.request().url()).searchParams.get('query')
    queries.push(query)
    if (query === 'slow') {
      delayedRequest = route

      return
    }
    await route.fulfill({ json: { icons: query === 'none' ? [] : ['carbon:search', 'carbon:close'] } })
  })
  await page.goto('/cs-CZ/vapor-icon-picker')
  await expect(page.getByTestId('icon-picker-example')).toHaveAttribute('data-ready', 'true')
  const field = page.getByTestId('icon-picker-field')
  const search = field.getByPlaceholder('Search icons')
  const items = field.locator('.icon-picker__content-item')
  await expect(search).toBeVisible()
  await expect(items).toHaveCount(0)
  expect(queries).toEqual([])
  await search.fill('sea')
  await expect(items).toHaveCount(2)
  await items.first().click()
  await expect(page.getByTestId('icon-picker-value')).toHaveText('carbon:search')
  await page.getByRole('button', { name: 'Toggle readonly', exact: true }).click()
  await items.last().click()
  await expect(page.getByTestId('icon-picker-value')).toHaveText('carbon:search')
  await page.getByRole('button', { name: 'Toggle readonly', exact: true }).click()
  await items.last().click()
  await expect(page.getByTestId('icon-picker-value')).toHaveText('carbon:close')
  await page.getByRole('button', { name: 'Toggle slots', exact: true }).click()
  await expect(search).toHaveCount(0)
  await expect(items).toHaveCount(0)
  await page.getByTestId('icon-custom-search').fill('none')
  await expect(page.getByTestId('icon-custom-content')).toHaveText('Custom results for none')
  await expect.poll(() => queries).toContain('none')
  await page.getByRole('button', { name: 'Toggle slots', exact: true }).click()
  await expect(search).toHaveValue('none')
  await expect(items).toHaveCount(0)
  await search.fill('carbon:search')
  await expect(items).toHaveCount(2)
  await expect.poll(() => queries).toContain('search')
  await search.fill('slow')
  await expect.poll(() => !!delayedRequest).toBe(true)
  await search.fill('a')
  await expect(items).toHaveCount(0)
  await delayedRequest.fulfill({ json: { icons: ['carbon:search'] } })
  await expect(items).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle search', exact: true }).click()
  await expect(search).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle search', exact: true }).click()
  await expect(search).toHaveValue('a')
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
  await expect(field).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
  await expect(search).toHaveValue('a')
  expect(problems).toEqual([])
})

test('IconPicker renders its initial fallback and localized navigation in SSR', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-icon-picker')
    const field = page.getByTestId('icon-picker-field')
    await expect(field.getByPlaceholder('Search icons')).toHaveValue('')
    await expect(field.locator('.icon-picker__content-item')).toHaveCount(0)
    await expect(field).toContainText('3')
    await expect(page.getByRole('link', { name: 'IconPicker · hledání a sloty', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-icon-picker')
  } finally {
    await context.close()
  }
})
