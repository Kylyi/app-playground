import { expect, test } from '@playwright/test'

test('UI hosts render automatically and hydrate without duplication', async ({ page, request }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' || /hydration/i.test(message.text())) {
      errors.push(message.text())
    }
  })

  const response = await request.get('/shared-tooltip')
  expect(response.ok()).toBe(true)
  expect(await response.text()).toMatch(/class="notifications\s/)

  await page.goto('/shared-tooltip')
  await expect(page.getByTestId('shared-tooltip-page')).toHaveAttribute('data-ready', 'true')
  await expect(page.locator('.notifications')).toHaveCount(1)

  await page.getByRole('button', { name: 'Show notification', exact: true }).click()
  await expect(page.locator('.notification-row')).toHaveCount(1)
  await expect(page.locator('.notification-row')).toContainText('Automatic notification host')

  await page.getByTestId('tooltip-trigger-a').dispatchEvent('mouseenter')
  await expect(page.locator('.tooltip')).toHaveCount(1)
  await expect(page.getByTestId('shared-bubble')).toContainText('Alpha content')
  await page.getByTestId('tooltip-trigger-a').dispatchEvent('mouseleave')
  await expect(page.locator('.tooltip')).toHaveCount(0)

  expect(errors).toEqual([])
})
