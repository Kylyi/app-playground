import { expect } from '@playwright/test'

export async function assertTableCellSlots(page) {
  const table = page.getByTestId('measured-table')
  const contracts = table.locator('[data-slot-contract]')
  const source = page.getByTestId('table-measurement')
  await expect(source).toHaveAttribute('data-ready', 'true')
  for (const card of [false, true]) {
    if (card) {
      await page.getByRole('button', { name: 'Toggle card view', exact: true }).click()
      await expect(table.locator('.tr.is-card')).toHaveCount(2)
    }
    await expect(contracts).toHaveCount(2)
    await page.getByRole('button', { name: 'Toggle cell slot content', exact: true }).click()
    await expect(contracts).toHaveCount(0)
    await expect(source).toHaveAttribute('data-active', '0')
    for (const value of ['123', '287']) {
      await expect(table.locator('.td[data-field="width"] span').filter({ hasText: new RegExp(`^${value}$`) })).toBeVisible()
    }
    await page.getByRole('button', { name: 'Toggle custom cell slot', exact: true }).click()
    await expect(contracts).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle cell slot content', exact: true }).click()
    await expect(contracts).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle custom cell slot', exact: true }).click()
    await expect(contracts).toHaveCount(2)
    await expect(table.locator('[data-slot-contract="width:287:1:object"]')).toBeVisible()
    await page.getByRole('button', { name: 'Toggle table', exact: true }).click()
    await expect(contracts).toHaveCount(0)
    await expect(source).toHaveAttribute('data-active', '0')
    await page.getByRole('button', { name: 'Toggle table', exact: true }).click()
    await expect(contracts).toHaveCount(2)
  }
}
