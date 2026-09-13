import { expect, test } from '@playwright/test'

test('scroll callbacks work in native Vapor and both List submit paths reach the owner once', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' || /hydration/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.goto('/vapor-events')
  const scroll = page.getByTestId('scroll-target')
  await expect(scroll).toHaveAttribute('data-ready', 'true')
  await scroll.evaluate(element => element.scrollTo(70, 0))
  await expect(page.getByTestId('scroll-position')).toHaveText('70')
  await scroll.evaluate(element => element.scrollTo(70, 90))
  await expect(page.getByTestId('scroll-position')).toHaveText('90')
  await page.getByTestId('exposed-submit').click()
  await expect(page.getByTestId('list-submits')).toHaveText('1')
  await expect(page.getByTestId('form-submits')).toHaveText('1')
  const item = page.getByTestId('list-events').getByRole('button', { name: 'Alpha' })
  await item.focus()
  await item.press('Control+Enter')
  await expect(page.getByTestId('list-submits')).toHaveText('2')
  await expect(page.getByTestId('form-submits')).toHaveText('2')
  await item.press('Meta+Enter')
  await expect(page.getByTestId('list-submits')).toHaveText('3')
  await expect(page.getByTestId('form-submits')).toHaveText('3')
  expect(errors).toEqual([])
})
