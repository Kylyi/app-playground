import { expect, test } from '@playwright/test'

test('VDOM parents can update inline config in all seven client-mounted Vapor consumers', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/recursive updates|Maximum call stack/i.test(message.text())) {
      problems.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vdom-prop-sync')
  await expect(page.getByTestId('prop-sync')).toHaveAttribute('data-ready', 'true')
  await page.getByRole('button', { name: 'Toggle components', exact: true }).click()
  await expect(page.getByTestId('sync-children')).toBeVisible()
  for (let revision = 1; revision <= 3; revision++) {
    await page.getByRole('button', { name: 'Update parent', exact: true }).click()
    await expect(page.getByTestId('revision')).toHaveText(String(revision))
    await expect(page.getByTestId('sync-children')).toHaveAttribute('data-revision', String(revision))
    await page.getByRole('button', { name: 'Toggle components', exact: true }).click()
    await expect(page.getByTestId('sync-children')).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle components', exact: true }).click()
    await expect(page.getByTestId('sync-children')).toBeVisible()
  }
  await expect(page.getByRole('link', { name: 'VDOM → Vapor · aktualizace props', exact: true }))
    .toHaveAttribute('href', '/cs-CZ/vdom-prop-sync')
  expect(problems).toEqual([])
})
