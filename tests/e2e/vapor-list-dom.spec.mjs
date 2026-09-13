import { expect, test } from '@playwright/test'

test('List measures empty DOM and keyboard navigation follows the remounted scroll root', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (/hydration/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.goto('/vapor-list-dom')
  await expect(page.getByTestId('list-dom')).toHaveAttribute('data-ready', 'true')
  const size = () => page.getByTestId('empty-size').textContent().then(JSON.parse)
  await expect.poll(async () => (await size()).height).toBe(48)
  const initialWidth = (await size()).width
  await page.getByRole('button', { name: 'Resize empty state' }).click()
  await expect.poll(async () => (await size()).width).toBeGreaterThan(initialWidth)

  for (let cycle = 0; cycle < 2; cycle++) {
    await page.getByRole('button', { name: 'Toggle items' }).click()
    const first = page.getByRole('button', { name: 'Item 1', exact: true })
    await first.focus()
    await first.press('ArrowDown')
    for (let step = 0; step < 3; step++) {
      await page.keyboard.press('PageDown')
    }
    const focused = page.locator('.list-row-item.is-focused')
    await expect(focused).toContainText('Item 16')
    await expect.poll(async () => focused.evaluate(element => {
      const row = element.getBoundingClientRect()
      const viewport = element.closest('.list-content').getBoundingClientRect()

      return row.top >= viewport.top - 1 && row.bottom <= viewport.bottom + 1
    })).toBe(true)
    await page.getByRole('button', { name: 'Toggle items' }).click()
    await expect(page.locator('.list-no-data')).toBeVisible()
    await expect.poll(async () => (await size()).height).toBe(48)
  }
  expect(errors).toEqual([])
})

test('List empty state renders on the server without measuring DOM', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  try {
    const page = await context.newPage()
    const response = await page.goto('/vapor-list-dom')
    expect(response.status()).toBe(200)
    await expect(page.locator('.list-no-data')).toBeVisible()
    await expect(page.getByTestId('empty-size')).toHaveText('{"height":0,"width":0}')
  } finally {
    await context.close()
  }
})
