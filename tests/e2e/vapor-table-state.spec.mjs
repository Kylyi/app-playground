import { expect, test } from '@playwright/test'

test('Table state in Vapor preserves legacy keys and isolates local instances', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' || /hydration/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.goto('/vapor-table-state')
  await expect(page.getByTestId('saved')).toHaveAttribute('data-ready', 'true')
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('LegacyTablePage'))
    state.customData = { count: 7 }
    localStorage.setItem('LegacyTablePage', JSON.stringify(state))
  })
  await page.reload()
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
    await expect(value('saved')).toHaveText('8')
    await expect(value('other')).toHaveText('1')
    await expect(value('local')).toHaveText('0')
    await expect(value('disabled')).toHaveText('0')
  }
  expect(await page.evaluate(ids => ids.map(id => localStorage.getItem(id)), localIds)).toEqual([null, null])
  expect(errors).toEqual([])
})

test('Table store owners render on the server without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
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
