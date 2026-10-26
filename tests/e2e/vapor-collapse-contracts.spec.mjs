import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics, createObservedContext } from './renderer-diagnostics.mjs'

assertRendererDiagnostics(test)

test('Collapse animates content resize, enforces its cap and releases measurement on removal', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-collapse-contracts')
  await expect(page.getByTestId('collapse-contracts')).toHaveAttribute('data-ready', 'true')
  const content = page.getByTestId('consumer-collapse').locator('.collapse__content')
  const height = () => content.evaluate(el => Math.round(el.getBoundingClientRect().height))
  const frame = await content.evaluate(el => {
    const style = getComputedStyle(el)
    const border = Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth)

    return { border, outside: style.boxSizing === 'border-box' ? 0 : border }
  })
  await expect.poll(height).toBe(60 + frame.border)
  await expect(content).toHaveCSS('transition-property', 'height')
  await page.getByRole('button', { name: 'Grow collapse content', exact: true }).click()
  await expect.poll(height).toBe(180 + frame.border)
  await page.getByRole('button', { name: 'Shrink collapse content', exact: true }).click()
  await expect.poll(height).toBe(40 + frame.border)
  await page.getByRole('button', { name: 'Grow collapse content', exact: true }).click()
  await page.getByRole('button', { name: 'Cap collapse height', exact: true }).click()
  await expect.poll(height).toBe(80 + frame.outside)
  await page.getByRole('button', { name: 'Zero collapse height', exact: true }).click()
  await expect(content).toHaveCSS('max-height', '0px')
  const header = page.getByTestId('consumer-collapse').locator('.collapse__header')
  await header.click()
  await expect(content).not.toBeVisible()
  await expect(content).toHaveCSS('max-height', '0px')
  await header.click()
  await page.getByRole('button', { name: 'Cap collapse height', exact: true }).click()
  await expect.poll(height).toBe(80 + frame.outside)
  await page.getByRole('button', { name: 'Toggle height calculation', exact: true }).click()
  await expect(content).not.toHaveClass(/(?:^|\s)auto-adjust-height(?:\s|$)/)
  expect(await content.evaluate(el => el.style.height)).toBe('')
  await page.getByRole('button', { name: 'Toggle height calculation', exact: true }).click()
  await expect.poll(height).toBe(80 + frame.outside)
  await page.getByRole('button', { name: 'Toggle collapse owner', exact: true }).click()
  await expect(content).toHaveCount(0)
  await page.getByRole('button', { name: 'Shrink collapse content', exact: true }).click()
  await page.getByRole('button', { name: 'Toggle collapse owner', exact: true }).click()
  await expect.poll(height).toBe(40 + frame.border)
})

test('a delayed Collapse opening cannot update its model after owner removal', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-collapse-contracts?mode=slow')
  await expect(page.getByTestId('collapse-contracts')).toHaveAttribute('data-ready', 'true')
  await page.getByTestId('consumer-collapse').locator('.collapse__header').click()
  await expect(page.getByTestId('collapse-pending')).toHaveText('true')
  await page.getByRole('button', { name: 'Toggle collapse owner', exact: true }).click()
  await expect(page.getByTestId('consumer-collapse')).toHaveCount(0)
  await page.getByRole('button', { name: 'Resolve delayed collapse opening', exact: true }).click()
  await expect(page.getByTestId('collapse-pending')).toHaveText('false')
  await expect(page.getByTestId('collapse-opened')).toHaveText('false')
  await expect(page.getByTestId('collapse-changes')).toHaveText('0')
})

test('Collapse server HTML preserves initial content and localized contract links', async ({ browser, baseURL }) => {
  const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-collapse-contracts')
    await expect(page.getByTestId('collapse-sized-content')).toBeVisible()
    await expect(page.getByTestId('collapse-sized-content')).toHaveCSS('height', '60px')
    await expect(page.getByRole('link', { name: 'Collapse · výška a cleanup', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-collapse-contracts')
    await expect(page.getByRole('link', { name: 'Collapse · odložené otevření', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-collapse-contracts?mode=slow')
  } finally {
    await context.close()
  }
})
