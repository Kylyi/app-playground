import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics } from './renderer-diagnostics.mjs'

assertRendererDiagnostics(test)

test('navigation reinitializes query variants, including browser history', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-virtual-scroller')
  const scroller = page.getByTestId('primary-scroller')
  await expect(page.getByTestId('virtual-example')).toHaveAttribute('data-ready', 'true')
  await expect(scroller).toHaveClass(/(?:^|\s)is-virtual(?:\s|$)/)

  await page.getByRole('link', { name: 'VirtualScroller · bez virtualizace', exact: true }).click()
  await expect(page).toHaveURL(/small=true/)
  await expect(scroller).not.toHaveClass(/(?:^|\s)is-virtual(?:\s|$)/)
  await expect(scroller.locator('.content-row')).toHaveCount(6)

  await page.goBack()
  await expect(scroller).toHaveClass(/(?:^|\s)is-virtual(?:\s|$)/)
  await page.goForward()
  await expect(scroller).not.toHaveClass(/(?:^|\s)is-virtual(?:\s|$)/)
  await expect(scroller.locator('.content-row')).toHaveCount(6)
})
