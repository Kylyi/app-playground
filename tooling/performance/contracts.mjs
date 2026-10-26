import { expect } from '@playwright/test'

/** Exercise renderer-specific directive behavior outside the timing contexts. */
export async function verifyButtonDirectives(page) {
  const surface = page.getByTestId('benchmark-surface')
  await page.addStyleTag({ content: '.ripple { animation-play-state: paused !important; }' })
  await surface.locator('.tree-collapse-btn').first().click()
  await expect(surface.locator('.ripple-container')).toHaveCount(1)
  await page.evaluate(() => window.gentlBenchmark.measure('update'))
  await expect(surface).toContainText('update 1')
  await page.evaluate(() => window.gentlBenchmark.measure('remove'))
  await expect(surface.locator('.ripple-container')).toHaveCount(0)
  await page.evaluate(() => window.gentlBenchmark.measure('mount'))
  await surface.locator('.tree-collapse-btn').first().click()
  await expect(surface.locator('.ripple-container')).toHaveCount(1)
  await page.evaluate(() => window.gentlBenchmark.measure('remove'))
  await expect(surface.locator('.ripple-container')).toHaveCount(0)
}
