import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics, createObservedContext } from './renderer-diagnostics.mjs'

assertRendererDiagnostics(test)

for (const mode of ['imported', 'registered', 'resolver']) {
  test(`consumer component descriptors preserve models, slots and public refs (${mode})`, async ({ page }) => {
    await page.goto(`/cs-CZ/vapor-consumer-contracts?mode=${mode}`)
    await expect(page.getByTestId('consumer-contracts')).toHaveAttribute('data-ready', 'true')
    const input = page.getByTestId('consumer-owner').locator('input')
    await expect(input).toHaveValue('Initial consumer value')
    await expect(input).toHaveAttribute('placeholder', 'Consumer editor')
    await expect(page.getByTestId('consumer-queue-size')).toHaveText('2')
    await page.getByRole('button', { name: 'Run consumer validation queue', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Consumer one', exact: true })).toBeFocused()
    await page.getByRole('button', { name: 'Focus consumer editor', exact: true }).click()
    await expect(input).toBeFocused()
    await input.fill('Edited consumer value')
    await expect(page.getByTestId('consumer-value')).toHaveText('Edited consumer value')
    await expect(page.getByTestId('consumer-updates')).toHaveText('1')
    await page.getByRole('button', { name: 'Replace consumer value', exact: true }).click()
    await expect(input).toHaveValue('Parent replacement')
    await expect(page.getByTestId('consumer-updates')).toHaveText('1')
    await page.getByRole('button', { name: 'Clear consumer editor', exact: true }).click()
    await expect(input).toHaveValue('')
    await page.locator('article[data-consumer-row]').getByRole('button', { name: 'Consumer zero', exact: true }).click()
    await expect(page.getByTestId('consumer-selection')).toHaveText('Consumer zero')
    await page.getByRole('button', { name: 'Toggle callable component', exact: true }).click()
    await expect(page.getByTestId('callable-content')).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle callable component', exact: true }).click()
    await expect(page.getByTestId('callable-content')).toBeVisible()
    await page.getByRole('button', { name: 'Toggle consumer', exact: true }).click()
    await expect(input).toHaveCount(0)
    await expect(page.getByTestId('consumer-queue-size')).toHaveText('0')
    await page.getByRole('button', { name: 'Toggle consumer', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Consumer zero', exact: true })).toBeVisible()
    await expect(page.getByTestId('consumer-queue-size')).toHaveText('2')
    await expect(input).toHaveValue('')
    await page.getByRole('button', { name: 'Focus consumer editor', exact: true }).click()
    await expect(input).toBeFocused()
  })

  test(`consumer component descriptors render server HTML before hydration (${mode})`, async ({ browser, baseURL }) => {
    const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false })
    try {
      const page = await context.newPage()
      await page.goto(`/cs-CZ/vapor-consumer-contracts?mode=${mode}`)
      await expect(page.getByTestId('consumer-owner').locator('input')).toHaveValue('Initial consumer value')
      await expect(page.getByTestId('consumer-owner').locator('input')).toHaveAttribute('placeholder', 'Consumer editor')
      await expect(page.locator('article[data-consumer-row]')).toHaveCount(2)
      await expect(page.getByTestId('callable-content')).toHaveText('Callable native component')
      await expect(page.getByRole('link', { name: 'Konzumenti · veřejné kontrakty', exact: true }))
        .toHaveAttribute('href', '/cs-CZ/vapor-consumer-contracts')
      await expect(page.getByRole('link', { name: 'Konzumenti · lazy registrace', exact: true }))
        .toHaveAttribute('href', '/cs-CZ/vapor-consumer-contracts?mode=registered')
      await expect(page.getByRole('link', { name: 'Konzumenti · resolver komponenty', exact: true }))
        .toHaveAttribute('href', '/cs-CZ/vapor-consumer-contracts?mode=resolver')
    } finally {
      await context.close()
    }
  })
}

test('concurrent SSR requests and hydrated consumers keep their models isolated', async ({ browser, baseURL }) => {
  const contexts = await Promise.all([false, true].map(javaScriptEnabled => {
    return createObservedContext(browser, { baseURL, javaScriptEnabled })
  }))
  try {
    const pages = await Promise.all(contexts.map(context => context.newPage()))
    await Promise.all(pages.map((page, index) => page.goto(`/cs-CZ/vapor-consumer-contracts?mode=registered&seed=Request-${index}`)))
    for (const [index, page] of pages.entries()) {
      await expect(page.getByTestId('consumer-owner').locator('input')).toHaveValue(`Request-${index}`)
      await expect(page.getByTestId('consumer-value')).toHaveText(`Request-${index}`)
      await expect(page.getByTestId('consumer-updates')).toHaveText('0')
    }
    await pages[1].getByTestId('consumer-owner').locator('input').fill('Hydrated request only')
    await expect(pages[1].getByTestId('consumer-value')).toHaveText('Hydrated request only')
    await expect(pages[0].getByTestId('consumer-value')).toHaveText('Request-0')
  } finally {
    await Promise.all(contexts.map(context => context.close()))
  }
})

test('async List searches discard stale results, report rejection, recover and dispose', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-consumer-contracts?mode=async')
  await expect(page.getByTestId('consumer-contracts')).toHaveAttribute('data-ready', 'true')
  await expect(page.locator('.list-loading')).toBeVisible()
  const calls = async () => Number(await page.getByTestId('list-search-calls').textContent())
  const nextSearch = async () => {
    const before = await calls()
    await page.getByRole('button', { name: 'Request newer list search', exact: true }).click()
    await expect.poll(calls).toBeGreaterThan(before)
  }
  await nextSearch()
  await page.getByRole('button', { name: 'Resolve latest list search', exact: true }).click()
  await expect(page.locator('article[data-consumer-row]')).toHaveText('Result Newest 1')
  await expect(page.locator('.list-loading')).toHaveCount(0)
  await page.getByRole('button', { name: 'Resolve oldest list search', exact: true }).click()
  await expect(page.locator('article[data-consumer-row]')).toHaveText('Result Newest 1')
  await nextSearch()
  await page.getByRole('button', { name: 'Reject latest list search', exact: true }).click()
  await expect(page.getByTestId('consumer-search-error')).toHaveText('Consumer search failed')
  await expect(page.getByTestId('list-search-errors')).toHaveText('1')
  await nextSearch()
  await page.getByRole('button', { name: 'Resolve latest list search', exact: true }).click()
  await expect(page.getByTestId('consumer-search-error')).toHaveCount(0)
  await expect(page.locator('article[data-consumer-row]')).toHaveText('Result Newest 3')
  await nextSearch()
  await page.getByRole('button', { name: 'Toggle consumer', exact: true }).click()
  await expect(page.getByTestId('consumer-owner')).toHaveCount(0)
  await expect(page.getByTestId('retained-list-items')).toHaveText('Result Newest 3')
  await page.getByRole('button', { name: 'Resolve latest list search', exact: true }).click()
  await expect(page.getByTestId('retained-list-items')).toHaveText('Result Newest 3')
  await page.getByRole('button', { name: 'Reject latest list search', exact: true }).click()
  await expect(page.getByTestId('list-search-errors')).toHaveText('1')
})

test('async List has matching deterministic server pending content', async ({ browser, baseURL }) => {
  const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-consumer-contracts?mode=async')
    await expect(page.locator('.list-loading')).toHaveCount(1)
    await expect(page.locator('article[data-consumer-row]')).toHaveCount(0)
    await expect(page.getByTestId('consumer-search-error')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Konzumenti · async hledání a cleanup', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-consumer-contracts?mode=async')
  } finally {
    await context.close()
  }
})
