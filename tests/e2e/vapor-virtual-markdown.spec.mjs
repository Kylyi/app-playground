import { expect, test } from '@playwright/test'

test('async Comark rows resize, collapse and recycle without overlap', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (/hydration.*mismatch/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  // Hold the real endpoint so the pre/post loading geometry is deterministic.
  let release
  let firstRequests = 0
  const gate = new Promise(resolve => release = resolve)
  await page.route('**/api/playground/markdown?*', async route => {
    if (new URL(route.request().url()).searchParams.get('id') === '0') {
      firstRequests++
    }
    await gate
    await route.continue()
  })
  await page.goto('/cs-CZ/vapor-virtual-markdown')
  const scroller = page.getByTestId('markdown-scroller')
  const first = page.locator('[data-note="0"]')
  const row = first.locator('..')
  await expect(first).toContainText('Čekám na obsah')
  const initialHeight = (await row.boundingBox()).height
  release()
  await expect(first.locator('h2')).toHaveText('Poznámka 1')
  await expect(first.locator('strong').last()).toHaveText('Proměnlivá výška')
  await expect.poll(async () => (await row.boundingBox()).height).toBeGreaterThan(initialHeight)
  async function noOverlap() {
    const gaps = await scroller.locator('.content-row').evaluateAll(rows => rows.slice(1).map((row, i) =>
      Math.abs(row.getBoundingClientRect().top - rows[i].getBoundingClientRect().bottom)))

    return gaps.length > 0 && gaps.every(gap => gap < 1)
  }
  await expect.poll(noOverlap).toBe(true)
  const wideHeight = (await row.boundingBox()).height
  await page.getByRole('button', { name: 'Změnit šířku' }).click()
  await expect.poll(async () => (await row.boundingBox()).height).toBeGreaterThan(wideHeight)
  await expect.poll(noOverlap).toBe(true)
  await first.getByRole('button', { name: 'Sbalit', exact: true }).click()
  await expect.poll(async () => (await row.boundingBox()).height).toBeLessThan(wideHeight)
  await expect.poll(noOverlap).toBe(true)
  await first.getByRole('button', { name: 'Rozbalit', exact: true }).click()
  await expect(first.locator('h2')).toBeVisible()
  await page.getByRole('button', { name: 'Na poznámku 101' }).click()
  await expect(page.locator('[data-note="100"] h2')).toHaveText('Poznámka 101')
  await expect(first).toHaveCount(0)
  await expect.poll(noOverlap).toBe(true)
  await expect.poll(() => scroller.locator('.content-row').count()).toBeLessThan(30)
  await page.getByRole('button', { name: 'Na začátek' }).click()
  await expect(first.locator('h2')).toBeVisible()
  await expect.poll(noOverlap).toBe(true)
  expect(firstRequests).toBe(1)
  expect(errors).toEqual([])
})

test('Markdown example serves bounded SSR previews and localized variants', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    const response = await page.goto('/cs-CZ/vapor-virtual-markdown?slow=true')
    expect(response.status()).toBe(200)
    await expect(page.locator('[data-note]')).toHaveCount(6)
    await expect(page.locator('[data-note="0"]')).toContainText('Náhled poznámky 1')
    await expect(page.getByRole('link', { name: 'VirtualScroller · async Markdown', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-virtual-markdown')
    await expect(page.getByRole('link', { name: 'VirtualScroller · pomalý Markdown', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-virtual-markdown?slow=true')
  } finally {
    await context.close()
  }
})
