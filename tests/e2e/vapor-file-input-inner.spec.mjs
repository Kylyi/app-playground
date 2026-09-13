import { expect, test } from '@playwright/test'

test('FileInputInner restores its add fallback and respects editing modes', async ({ page }) => {
  const problems = []
  page.on('pageerror', error => problems.push(error.message))
  page.on('console', message => {
    if (/hydration|no active component/i.test(message.text())) {
      problems.push(message.text())
    }
  })
  await page.goto('/cs-CZ/vapor-file-input-inner')
  await expect(page.getByTestId('file-inner-example')).toHaveAttribute('data-ready', 'true')
  const field = page.getByTestId('file-inner-field')
  const add = field.locator('.file-add')
  await expect(field.locator('.file-preview__filename')).toHaveText('example.txt')
  await add.click()
  await expect(page.getByTestId('file-inner-dialogs')).toHaveText('1')
  await page.getByRole('button', { name: 'Toggle add slot', exact: true }).click()
  await expect(add).toHaveCount(0)
  await field.getByRole('button', { name: 'Custom add', exact: true }).click()
  await expect(page.getByTestId('file-inner-dialogs')).toHaveText('2')
  await page.getByRole('button', { name: 'Toggle add slot', exact: true }).click()
  await expect(add).toBeVisible()
  for (const mode of ['readonly', 'disabled']) {
    await page.getByRole('button', { name: `Toggle ${mode}`, exact: true }).click()
    await expect(add).toHaveCount(0)
    await expect(field.locator('.file-preview__header').getByRole('button')).toHaveCount(0)
    await page.getByRole('button', { name: `Toggle ${mode}`, exact: true }).click()
    await expect(add).toBeVisible()
  }
  await field.locator('.file-preview__header').getByRole('button').click()
  await expect(page.getByTestId('file-inner-count')).toHaveText('0')
  await expect(field.locator('.file-preview')).toHaveCount(0)
  await expect(page.getByTestId('file-inner-dialogs')).toHaveText('2')
  await page.getByRole('button', { name: 'Toggle multiple', exact: true }).click()
  await expect(add).toHaveCount(0)
  await field.click()
  await expect(page.getByTestId('file-inner-dialogs')).toHaveText('3')
  for (const mode of ['readonly', 'disabled']) {
    await page.getByRole('button', { name: `Toggle ${mode}`, exact: true }).click()
    await field.click()
    await expect(page.getByTestId('file-inner-dialogs')).toHaveText('3')
    await page.getByRole('button', { name: `Toggle ${mode}`, exact: true }).click()
  }
  expect(problems).toEqual([])
})

test('FileInputInner renders file and default add control during SSR', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-file-input-inner')
    const field = page.getByTestId('file-inner-field')
    await expect(field.locator('.file-preview__filename')).toHaveText('example.txt')
    await expect(field.locator('.file-add')).toBeVisible()
    await expect(page.getByRole('link', { name: 'FileInputInner · přidání souboru', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-file-input-inner')
  } finally {
    await context.close()
  }
})
