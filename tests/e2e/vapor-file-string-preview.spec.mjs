import { expect, test } from '@playwright/test'

for (const mobile of [false, true]) {
  test(`FileStringPreview confirms removal and updates file actions (mobile=${mobile})`, async ({ page }) => {
    const problems = []
    page.on('pageerror', error => problems.push(error.message))
    page.on('console', message => {
      if (/hydration|no active component/i.test(message.text())) {
        problems.push(message.text())
      }
    })
    if (mobile) {
      await page.setViewportSize({ width: 390, height: 844 })
    }
    await page.goto('/cs-CZ/vapor-file-string-preview')
    await expect(page.getByTestId('string-preview-example')).toHaveAttribute('data-ready', 'true')
    const preview = page.getByTestId('string-preview')
    const remove = preview.locator('.file-preview--header button')
    const confirm = page.locator('[data-cy="confirm-delete"]')
    await expect.poll(() => preview.locator('img').evaluate(el => el.naturalWidth)).toBeGreaterThan(0)
    await remove.click()
    await expect(confirm).toBeVisible()
    await confirm.focus()
    await page.keyboard.press('Escape')
    await expect(confirm).toHaveCount(0)
    await expect(page.getByTestId('string-preview-removed')).toHaveText('0')
    await remove.click()
    await expect(confirm).toBeVisible()
    await confirm.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('string-preview-removed')).toHaveText('1')
    await expect(confirm).toHaveCount(0)
    await page.getByRole('button', { name: 'Change file', exact: true }).click()
    await expect(preview.locator('img')).toHaveCount(0)
    await expect(preview).toContainText('changed.txt')
    const downloading = page.waitForEvent('download')
    await preview.locator(':scope > button').click()
    const downloaded = await downloading
    expect(downloaded.suggestedFilename()).toBe('changed.txt')
    expect(await downloaded.failure()).toBeNull()
    await page.getByRole('button', { name: 'Toggle actions', exact: true }).click()
    await expect(preview.getByRole('button')).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle actions', exact: true }).click()
    await expect(preview.getByRole('button')).toHaveCount(2)
    await page.getByRole('button', { name: 'Toggle editable', exact: true }).click()
    await expect(remove).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle editable', exact: true }).click()
    await remove.click()
    await expect(confirm).toBeVisible()
    await page.getByRole('button', { name: 'Toggle owner', exact: true }).evaluate(el => el.click())
    await expect(confirm).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
    await remove.click()
    await expect(confirm).toBeVisible()
    await confirm.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('string-preview-removed')).toHaveText('2')
    expect(problems).toEqual([])
  })
}

test('FileStringPreview renders its image and closed confirmation during SSR', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-file-string-preview')
    await expect(page.getByTestId('string-preview').locator('img')).toHaveAttribute('alt', 'Remote image')
    await expect(page.locator('[data-cy="confirm-delete"]')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'FileStringPreview · potvrzení odebrání', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-file-string-preview')
  } finally {
    await context.close()
  }
})
