import { expect } from '@playwright/test'

export async function assertTreeSourceCommit(page) {
  await expect(page.getByTestId('tree-initialization')).toHaveAttribute('data-ready', 'true')
  const labels = page.locator('.tree-node__content-label')
  const original = ['Alpha', 'Match A', 'Beta', 'Match B']
  const edited = ['Alpha', 'Match renamed A', 'Beta', 'Match B']
  await expect(labels).toHaveText(original)
  for (let cycle = 0; cycle < 2; cycle++) {
    await page.getByRole('button', { name: 'Rename matched source node', exact: true }).click()
    await expect(labels).toHaveText(edited)
    await page.getByRole('button', { name: 'Toggle initialized tree', exact: true }).click()
    await expect(labels).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle initialized tree', exact: true }).click()
    await expect(labels).toHaveText(edited)
    await page.getByRole('button', { name: 'Rename matched source node', exact: true }).click()
    await expect(labels).toHaveText(original)
  }
}
