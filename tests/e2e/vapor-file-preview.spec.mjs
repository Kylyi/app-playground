import { expect, test } from '@playwright/test'

test('Vapor preview switches media and owns dialog and blob lifetimes', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (/hydration|resolveCssVars/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.addInitScript(() => {
    window.previewUrls = { created: [], revoked: [] }
    const create = URL.createObjectURL.bind(URL)
    const revoke = URL.revokeObjectURL.bind(URL)
    URL.createObjectURL = blob => {
      const url = create(blob)
      window.previewUrls.created.push(url)

      return url
    }
    URL.revokeObjectURL = url => {
      window.previewUrls.revoked.push(url)
      revoke(url)
    }
  })
  await page.goto('/cs-CZ/vapor-file-preview')
  await expect(page.getByTestId('file-preview-fixture')).toHaveAttribute('data-ready', 'true')
  const thumbnail = page.locator('.file-preview__thumbnail')
  const dialog = page.locator('.dialog__wrapper')
  await expect.poll(() => thumbnail.evaluate(el => el.naturalWidth)).toBeGreaterThan(0)
  for (let index = 0; index < 2; index++) {
    await thumbnail.click()
    await expect(dialog.locator('img')).toHaveAttribute('alt', 'Remote image')
    await expect.poll(() => dialog.locator('img').evaluate(el => {
      const box = el.getBoundingClientRect()

      return Math.abs(box.x + box.width / 2 - window.innerWidth / 2)
    })).toBeLessThan(3)
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
  }
  await page.getByRole('button', { name: 'Local image', exact: true }).click()
  await expect(thumbnail).toHaveAttribute('src', /^blob:/)
  await expect.poll(() => thumbnail.evaluate(el => el.naturalWidth)).toBeGreaterThan(0)
  const firstUrl = await thumbnail.getAttribute('src')
  await thumbnail.click()
  await expect(dialog.locator('img')).toHaveAttribute('src', firstUrl)
  await page.getByRole('button', { name: 'Local image', exact: true }).evaluate(el => el.click())
  await expect(dialog).toHaveCount(0)
  await expect(thumbnail).not.toHaveAttribute('src', firstUrl)
  await expect.poll(() => page.evaluate(() => window.previewUrls.revoked)).toContain(firstUrl)
  await thumbnail.click()
  await expect(dialog.locator('img')).toHaveAttribute('alt', 'Local 2')
  await page.getByRole('button', { name: 'Toggle preview' }).evaluate(el => el.click())
  await expect(dialog).toHaveCount(0)
  await expect(page.locator('.backdrop')).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => window.previewUrls.revoked.length)).toBe(2)
  await page.getByRole('button', { name: 'Local video', exact: true }).click()
  await expect(page.locator('.file-preview video')).toHaveAttribute('src', /^blob:/)
  await expect(thumbnail).toHaveCount(0)
  await page.getByRole('button', { name: 'Document', exact: true }).click()
  await expect(page.locator('.file-preview video, .file-preview img')).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => window.previewUrls.revoked.length)).toBe(3)
  await page.locator('.file-preview__header button').click()
  await expect(page.locator('.file-preview')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('preview SSR includes image and localized navigation without an open dialog', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-file-preview')
    await expect(page.locator('.file-preview__thumbnail')).toHaveAttribute('alt', 'Remote image')
    await expect(page.locator('.dialog__wrapper')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'FilePreview · obrázek a dialog', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-file-preview')
  } finally {
    await context.close()
  }
})
