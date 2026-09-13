import { expect, test } from '@playwright/test'

test('native grid recycles both axes, aligns headers and recalculates resized columns', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (/hydration.*mismatch/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-virtual-grid')
  await expect(page.getByTestId('virtual-grid-example')).toHaveAttribute('data-ready', 'true')
  const scroller = page.locator('.table-content.virtual-scroll')
  const cell = (row, column) => scroller.locator(`.td[data-key="${row}"][data-field="field_${column}"]`)
  const header = column => page.locator(`.table-header [data-column="field_${column}"]`)
  await expect(cell(0, 0)).toHaveText('Row 0 · Col 0')
  await expect.poll(() => scroller.locator('.virtual-scroll__row').count()).toBeLessThan(30)
  await expect.poll(() => scroller.locator('.virtual-scroll__row').first().locator('.td').count()).toBeLessThan(12)

  await page.getByRole('button', { name: 'Go to row 500, column 60', exact: true }).click()
  await expect(cell(500, 60)).toHaveText('Row 500 · Col 60')
  await expect(cell(0, 0)).toHaveCount(0)
  await expect(scroller.locator('.td[data-field="field_0"]')).toHaveCount(0)
  await expect.poll(async () => Math.abs(
    await scroller.evaluate(el => el.scrollLeft)
    - await page.locator('.table-header .content').evaluate(el => el.scrollLeft),
  )).toBeLessThan(1)
  await expect.poll(async () => Math.abs((await cell(500, 60).boundingBox()).x - (await header(60).boundingBox()).x))
    .toBeLessThan(1)

  const splitter = page.locator('.table-header .splitter:not(.splitter--active)').nth(60)
  const box = await splitter.boundingBox()
  const widthBefore = (await cell(500, 60).boundingBox()).width
  await page.mouse.move(box.x + box.width / 2, box.y + 8)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 50, box.y + 8, { steps: 8 })
  await page.mouse.up()
  await expect.poll(async () => (await cell(500, 60).boundingBox()).width).toBeGreaterThan(widthBefore + 40)
  await expect.poll(async () => Math.abs((await cell(500, 61).boundingBox()).x - (await header(61).boundingBox()).x))
    .toBeLessThan(1)

  await scroller.evaluate(el => {
    el.scrollLeft = el.scrollWidth
    el.scrollTop = el.scrollHeight
  })
  await expect(cell(999, 79)).toHaveText('Row 999 · Col 79')
  await page.getByRole('button', { name: 'Go to origin', exact: true }).click()
  await expect(cell(0, 0)).toHaveText('Row 0 · Col 0')
  await page.getByRole('button', { name: 'Toggle grid', exact: true }).click()
  await expect(scroller).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle grid', exact: true }).click()
  await expect(cell(0, 0)).toHaveText('Row 0 · Col 0')
  expect(errors).toEqual([])
})

test('grid SSR renders a bounded initial rectangle without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-virtual-grid')
    const scroller = page.locator('.table-content.virtual-scroll')
    await expect(scroller.locator('.virtual-scroll__row')).toHaveCount(8)
    await expect(scroller.locator('.td[data-key="0"][data-field="field_0"]')).toHaveText('Row 0 · Col 0')
    const columns = await scroller.locator('.virtual-scroll__row').first().locator('.td').count()
    expect(columns).toBeGreaterThan(0)
    expect(columns).toBeLessThan(12)
    await expect(page.getByRole('link', { name: 'VirtualScroller · 1 000 × 80', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-virtual-grid')
  } finally {
    await context.close()
  }
})
