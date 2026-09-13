import { expect, test } from '@playwright/test'

test('FilePreview owns image URLs and preserves upload and download states', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component/i.test(message.text())) {
      problems.push(message.text())
    }
  })
  await page.addInitScript(() => {
    window.uploadUrls = { created: [], revoked: [] }
    const create = URL.createObjectURL.bind(URL)
    const revoke = URL.revokeObjectURL.bind(URL)
    URL.createObjectURL = blob => {
      const url = create(blob)
      window.uploadUrls.created.push(url)

      return url
    }
    URL.revokeObjectURL = url => {
      window.uploadUrls.revoked.push(url)
      revoke(url)
    }
  })
  await page.goto('/cs-CZ/vapor-upload-preview')
  await expect(page.getByTestId('upload-preview-example')).toHaveAttribute('data-ready', 'true')
  const preview = page.getByTestId('upload-preview')
  const img = preview.locator('img')
  const download = preview.getByRole('button', { name: 'Download file', exact: true })
  await expect(download).toHaveCount(0)
  await expect.poll(() => img.evaluate(el => el.naturalWidth)).toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Toggle download', exact: true }).click()
  const downloading = page.waitForEvent('download')
  await download.click()
  expect(await (await downloading).failure()).toBeNull()
  await page.getByRole('button', { name: 'Toggle download', exact: true }).click()
  await expect(download).toHaveCount(0)
  await page.getByRole('button', { name: 'Local image', exact: true }).click()
  await expect(img).toHaveAttribute('src', /^blob:/)
  await expect.poll(() => img.evaluate(el => el.naturalWidth)).toBeGreaterThan(0)
  const first = await img.getAttribute('src')
  await page.getByRole('button', { name: 'Local image', exact: true }).click()
  await expect(img).not.toHaveAttribute('src', first)
  await expect.poll(() => page.evaluate(() => window.uploadUrls.revoked)).toContain(first)
  const second = await img.getAttribute('src')
  await page.getByRole('button', { name: 'Toggle image', exact: true }).click()
  await expect(img).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => window.uploadUrls.revoked)).toContain(second)
  await page.getByRole('button', { name: 'Toggle image', exact: true }).click()
  await expect(img).toHaveAttribute('src', /^blob:/)
  await page.getByRole('button', { name: 'Uploading', exact: true }).click()
  await expect(preview.locator('.file-preview__download')).toContainText('50')
  await page.getByRole('button', { name: 'Failed', exact: true }).click()
  await expect(preview.locator('.file-preview__download button')).toHaveCount(1)
  await page.getByRole('button', { name: 'Uploaded', exact: true }).click()
  await expect(download).toHaveCount(0)
  await expect(preview.locator('.file-preview__download button')).toHaveCount(1)
  await page.getByRole('button', { name: 'Toggle download', exact: true }).click()
  await expect(download).toBeVisible()
  await preview.locator('.file-preview__header button').click()
  await expect(preview).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => window.uploadUrls.revoked.length)).toBe(3)
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
  await expect(img).toHaveAttribute('src', /^blob:/)
  await page.getByRole('button', { name: 'Toggle owner', exact: true }).click()
  await expect.poll(() => page.evaluate(() => window.uploadUrls.revoked.length)).toBe(4)
  expect(problems).toEqual([])
})

test('FilePreview SSR renders the remote image and respects noDownloadButton', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-upload-preview')
    const preview = page.getByTestId('upload-preview')
    await expect(preview.locator('img')).toHaveAttribute('alt', 'Remote image')
    await expect(preview.locator('.file-preview__download')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'FilePreview · upload a životnost URL', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-upload-preview')
  } finally {
    await context.close()
  }
})
