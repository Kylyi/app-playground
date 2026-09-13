import { Buffer } from 'node:buffer'
import { expect, test } from '@playwright/test'

test('FileInputSimple owns chooser clicks and uses explicit focus across scroller changes', async ({ page }) => {
  const problems = []
  const choosers = []
  page.on('filechooser', chooser => choosers.push(chooser))
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component/i.test(message.text())) {
      problems.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-file-input-simple')
  await expect(page.getByTestId('file-simple-example')).toHaveAttribute('data-ready', 'true')
  const field = page.getByTestId('file-simple-field')
  const control = field.locator('span.control')
  await control.focus()
  await expect(control).toBeFocused()
  await expect(page.getByTestId('file-simple-focus')).toHaveText('1/0')
  expect(choosers).toHaveLength(0)
  await page.getByRole('button', { name: 'Toggle scroller', exact: true }).focus()
  await expect(page.getByTestId('file-simple-focus')).toHaveText('1/1')

  for (let index = 0; index < 2; index++) {
    const chooserPromise = page.waitForEvent('filechooser')
    await field.locator('.input-wrapper__regular-append').getByRole('button').click()
    await (await chooserPromise).setFiles({ name: `file${index}.txt`, mimeType: 'text/plain', buffer: Buffer.from('file') })
    await expect(page.getByTestId('file-simple-names')).toHaveText(`file${index}.txt`)
    await expect(field.locator('.chip')).toContainText(`file${index}.txt`)
    for (const mode of ['readonly', 'disabled']) {
      await page.getByRole('button', { name: `Toggle ${mode}`, exact: true }).click()
      await expect(field.locator('.chip').getByRole('button')).toHaveCount(0)
      await expect(field.getByRole('button', { name: 'i-material-symbols:attachment', exact: true })).toBeDisabled()
      await control.click({ position: { x: 4, y: 4 } })
      await page.getByRole('button', { name: `Toggle ${mode}`, exact: true }).click()
    }
    const inner = field.locator(index ? '.scroller-horizontal > .content' : '.file-input-simple__inner')
    const bounds = await inner.boundingBox()
    const innerChooser = page.waitForEvent('filechooser')
    await inner.click({ position: { x: bounds.width - 4, y: bounds.height / 2 } })
    await (await innerChooser).setFiles({ name: `file${index}.txt`, mimeType: 'text/plain', buffer: Buffer.from('file') })
    await field.locator('.chip').getByRole('button').click()
    await expect(page.getByTestId('file-simple-names')).toHaveText('empty')
    const contentChooser = page.waitForEvent('filechooser')
    await control.click({ position: { x: 4, y: 4 } })
    await (await contentChooser).setFiles({ name: 'content.txt', mimeType: 'text/plain', buffer: Buffer.from('content') })
    await expect(page.getByTestId('file-simple-names')).toHaveText('content.txt')
    expect(choosers).toHaveLength((index + 1) * 3)
    await page.getByRole('button', { name: 'Toggle scroller', exact: true }).click()
  }
  await page.getByRole('button', { name: 'Toggle input owner', exact: true }).click()
  await expect(field).toHaveCount(0)
  await page.getByRole('button', { name: 'Toggle input owner', exact: true }).click()
  await control.focus()
  await expect(control).toBeFocused()
  await expect(field.locator('.chip')).toContainText('content.txt')
  expect(choosers).toHaveLength(6)
  expect(problems).toEqual([])
})

test('FileInputSimple renders its placeholder and localized navigation during SSR', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-file-input-simple')
    await expect(page.getByTestId('file-simple-field').locator('span.control'))
      .toHaveAttribute('data-placeholder', 'Choose a file')
    await expect(page.getByRole('link', { name: 'FileInputSimple · focus a scroller', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-file-input-simple')
  } finally {
    await context.close()
  }
})
