import { expect } from '@playwright/test'

export async function assertHoverScroll({ page, reducedMotion, removeOwner }) {
  await expect(page.getByTestId('overflow')).toHaveAttribute('data-ready', 'true')
  await page.clock.install()
  await page.clock.pauseAt(new Date(Date.now() + 1000))
  const target = page.getByTestId('overflow').locator('.overflow-box').first()
  const maximum = await target.evaluate(el => el.scrollWidth - el.clientWidth)
  expect(maximum).toBeGreaterThan(50)
  await target.hover()
  await expect(target).toHaveAttribute('data-hover-text-scroll', '')
  await page.clock.runFor(200)
  const position = await target.evaluate(el => el.scrollLeft)
  if (reducedMotion === 'reduce') {
    expect(position).toBe(maximum)
  } else {
    expect(position).toBeGreaterThan(0)
    expect(position).toBeLessThan(maximum)
  }
  await target.dispatchEvent('mouseleave')
  if (reducedMotion !== 'reduce') {
    await page.clock.runFor(1000)
  }
  await expect.poll(() => target.evaluate(el => el.scrollLeft)).toBe(0)
  await expect(target).not.toHaveAttribute('data-hover-text-scroll', '')
  await target.dispatchEvent('mouseenter')
  await page.clock.runFor(200)
  const replaced = await target.elementHandle()
  await page.getByTestId('overflow').getByRole('button', { name: 'Remove and refresh', exact: true }).evaluate(el => el.click())
  await expect(page.getByTestId('overflow').locator('.overflow-box')).toHaveCount(1)
  await page.clock.runFor(2000)
  expect(await replaced.evaluate(el => ({
    connected: el.isConnected,
    left: el.scrollLeft,
    scrolling: el.hasAttribute('data-hover-text-scroll'),
  }))).toEqual({ connected: false, left: 0, scrolling: false })
  await page.getByTestId('overflow').getByRole('button', { name: 'Restore first', exact: true }).click()
  await expect(page.getByTestId('overflow').locator('.overflow-box')).toHaveCount(2)
  await target.hover()
  await expect(target).toHaveAttribute('data-hover-text-scroll', '')
  await page.clock.runFor(200)
  const element = await target.elementHandle()
  await removeOwner()
  await page.clock.runFor(2000)
  expect(await element.evaluate(el => ({
    connected: el.isConnected,
    left: el.scrollLeft,
    scrolling: el.hasAttribute('data-hover-text-scroll'),
  }))).toEqual({ connected: false, left: 0, scrolling: false })
}
