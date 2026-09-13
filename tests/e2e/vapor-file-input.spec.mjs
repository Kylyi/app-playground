import { Buffer } from 'node:buffer'
import { expect, test } from '@playwright/test'

for (const multi of [false, true]) {
  test(`FileInput scoped chooser, removal and drop survive slot changes (multi=${multi})`, async ({ page }) => {
    const problems = []
    page.on('pageerror', error => problems.push(error.message))
    page.on('console', message => {
      if (/hydration|no active component/i.test(message.text())) {
        problems.push(message.text())
      }
    })
    await page.goto(`/cs-CZ/vapor-file-input${multi ? '?multi=true' : ''}`)
    await expect(page.getByTestId('file-input-example')).toHaveAttribute('data-ready', 'true')
    const field = page.getByTestId('file-input-field')
    await expect(field.locator('.file-input__inner')).toBeVisible()
    await expect(field.locator('.file-input__empty')).toHaveCount(multi ? 0 : 1)
    await page.getByRole('button', { name: 'Toggle slots', exact: true }).click()
    await expect(field.locator('.file-input__inner')).toHaveCount(0)
    await expect(page.getByTestId('file-input-empty-custom')).toBeVisible()
    const firstChooser = page.waitForEvent('filechooser')
    await page.getByTestId('file-input-empty-custom').click()
    const chooser = await firstChooser
    expect(chooser.isMultiple()).toBe(multi)
    expect(await chooser.element().getAttribute('accept')).toBe('text/plain')
    await chooser.setFiles({ name: 'first.txt', mimeType: 'text/plain', buffer: Buffer.from('first') })
    await expect(page.getByTestId('file-input-names')).toHaveText('first.txt')
    await expect(page.getByTestId('file-input-empty-custom')).toHaveCount(0)
    const nextChooser = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Choose files', exact: true }).click()
    await (await nextChooser).setFiles({ name: 'second.txt', mimeType: 'text/plain', buffer: Buffer.from('second') })
    await expect(page.getByTestId('file-input-names')).toHaveText(multi ? 'first.txt,second.txt' : 'second.txt')
    await page.getByRole('button', { name: 'Remove second.txt', exact: true }).click()
    if (multi) {
      await page.getByRole('button', { name: 'Remove first.txt', exact: true }).click()
    }
    await expect(page.getByTestId('file-input-names')).toHaveText('empty')
    await page.getByRole('button', { name: 'Toggle slots', exact: true }).click()
    await expect(field.locator('.file-input__inner')).toBeVisible()
    await expect(field.locator('.file-input__empty')).toHaveCount(multi ? 0 : 1)
    await page.getByRole('button', { name: 'Toggle slots', exact: true }).click()
    const transfer = await page.evaluateHandle(() => {
      const data = new DataTransfer()
      data.items.add(new File(['drop'], 'dropped.txt', { type: 'text/plain' }))

      return data
    })
    await field.dispatchEvent('dragenter', { dataTransfer: transfer })
    await expect(page.getByTestId('file-input-custom')).toHaveAttribute('data-dragging', 'true')
    await field.dispatchEvent('drop', { dataTransfer: transfer })
    await expect(page.getByTestId('file-input-custom')).toHaveAttribute('data-dragging', 'false')
    await expect(page.getByTestId('file-input-names')).toHaveText('dropped.txt')
    await page.getByRole('button', { name: 'Toggle slots', exact: true }).click()
    await expect(field.locator('.file-input__inner')).toBeVisible()
    await expect(field.locator('.file-preview__filename')).toHaveText('dropped.txt')
    await page.getByRole('button', { name: 'Toggle input owner', exact: true }).click()
    await expect(field).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle input owner', exact: true }).click()
    await expect(field.locator('.file-preview__filename')).toHaveText('dropped.txt')
    await field.dispatchEvent('dragenter', { dataTransfer: transfer })
    await field.dispatchEvent('drop', { dataTransfer: transfer })
    await expect(page.getByTestId('file-input-names')).toHaveText(multi ? 'dropped.txt,dropped.txt' : 'dropped.txt')
    await expect(page.getByTestId('file-input-events')).toHaveText(multi ? '4/2' : '4/1')
    await transfer.dispose()
    expect(problems).toEqual([])
  })
}

test('FileInput renders default empty content and both localized links in SSR', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-file-input')
    const field = page.getByTestId('file-input-field')
    await expect(field.locator('.file-input__inner')).toBeVisible()
    await expect(field.locator('.file-input__empty')).toBeVisible()
    await expect(page.getByRole('link', { name: 'FileInput · sloty a soubory', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-file-input')
    await expect(page.getByRole('link', { name: 'FileInput · více souborů', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-file-input?multi=true')
  } finally {
    await context.close()
  }
})
