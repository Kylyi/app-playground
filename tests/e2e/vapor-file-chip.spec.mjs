import { expect, test } from '@playwright/test'

test('FileChip updates its label, downloads and isolates click events', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component/i.test(message.text())) {
      problems.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-file-chip')
  await expect(page.getByTestId('file-chip-example')).toHaveAttribute('data-ready', 'true')
  const chip = page.getByTestId('file-chip')
  const download = chip.getByRole('button', { name: 'i-material-symbols:download', exact: true })
  await expect(chip).toContainText('example.txt (4 B)')
  await chip.locator('span[truncate]').click()
  await expect(page.getByTestId('file-chip-events')).toHaveText('0/0')
  await page.getByRole('button', { name: 'Change file', exact: true }).click()
  await expect(chip).toContainText('changed.txt (2 KB)')
  const downloadPromise = page.waitForEvent('download')
  await download.click()
  const downloaded = await downloadPromise
  expect(downloaded.suggestedFilename()).toBe('changed.txt')
  expect(await downloaded.failure()).toBeNull()
  await expect(page.getByTestId('file-chip-events')).toHaveText('0/0')
  await expect(page.locator('a.download-link')).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle download', exact: true }).click()
  await expect(download).toHaveCount(0)
  await chip.getByRole('button').click()
  await expect(page.getByTestId('file-chip-events')).toHaveText('1/0')
  for (const mode of ['readonly', 'disabled']) {
    await page.getByRole('button', { name: `Toggle ${mode}`, exact: true }).click()
    await expect(chip.getByRole('button')).toHaveCount(0)
    await page.getByRole('button', { name: `Toggle ${mode}`, exact: true }).click()
    await expect(chip.getByRole('button')).toHaveCount(1)
  }
  expect(problems).toEqual([])
})

test('FileChip renders its formatted label in SSR with localized navigation', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-file-chip')
    await expect(page.getByTestId('file-chip')).toContainText('example.txt (4 B)')
    await expect(page.getByRole('link', { name: 'FileChip · stažení a události', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-file-chip')
  } finally {
    await context.close()
  }
})
