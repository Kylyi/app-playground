import { expect } from '@playwright/test'

export async function assertPivotCellContracts(page, locale) {
  await expect(page.getByTestId('table-pivot-dom')).toHaveAttribute('data-ready', 'true')
  const cells = page.locator('.pivot-content__values .pivot-value-item-cell')
  const inline = cells.first()
  const standalone = page.getByTestId('standalone-pivot-cell').locator('.pivot-value-item-cell')
  const counts = page.getByTestId('pivot-clicks')
  async function expectValue(value) {
    for (const cell of [inline, standalone]) {
      await expect(cell).toHaveText(value)
      await expect(cell).toHaveAttribute('aria-label', new RegExp(value))
      await expect(cell).toHaveAttribute('role', 'button')
      await expect(cell).toHaveAttribute('tabindex', '0')
    }
    expect(await standalone.getAttribute('aria-label')).toBe(await inline.getAttribute('aria-label'))
    expect(await standalone.evaluate(el => el.style.width)).toBe(await inline.evaluate(el => el.style.width))
  }

  await expectValue(`Format A ${locale}: 1`)
  await expect(cells.locator('span').filter({ hasText: /^0$/ }).first()).toBeVisible()
  // Missing aggregates retain an empty cell instead of rendering a zero.
  await expect(page.locator('.pivot-content__values .pivot-value-item-cell:not(:has(span))').first()).toBeVisible()
  await inline.click()
  await expect(counts).toHaveText('0:1')
  await expect(page.getByTestId('pivot-last-cell')).toHaveText('Item 0:1:true')
  await standalone.press('Enter')
  await expect(counts).toHaveText('0:2')
  await page.getByRole('button', { name: 'Use zero aggregate', exact: true }).click()
  await expectValue(`Format A ${locale}: 0`)
  await page.getByRole('button', { name: 'Replace cell format', exact: true }).click()
  await expectValue(`Format B ${locale}: 0`)
  await page.getByRole('button', { name: 'Toggle value orientation', exact: true }).click()
  await expect(page.locator('.pivot-row-item').first()).toContainText('value')
  await expectValue(`Format B ${locale}: 0`)
  await page.getByRole('button', { name: 'Cycle cell interaction', exact: true }).click()
  await standalone.press('Space')
  await expect(counts).toHaveText('1:2')
  await inline.press('Enter')
  await expect(counts).toHaveText('2:2')
  await page.getByRole('button', { name: 'Cycle cell interaction', exact: true }).click()
  for (const cell of [inline, standalone]) {
    await expect(cell).not.toHaveAttribute('role')
    await expect(cell).not.toHaveAttribute('tabindex')
    await expect(cell).not.toHaveAttribute('aria-label')
    await cell.click()
  }
  await expect(counts).toHaveText('2:2')
  await page.getByRole('button', { name: 'Cycle cell interaction', exact: true }).click()
  await page.getByRole('button', { name: 'Toggle tables', exact: true }).click()
  await expect(inline).toHaveCount(0)
  await expect(standalone).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle tables', exact: true }).click()
  await expectValue(`Format B ${locale}: 0`)
}
