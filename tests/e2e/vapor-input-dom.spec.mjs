import { expect, test } from '@playwright/test'

test('input DOM APIs, label alignment and file drop targets survive layout changes and remount', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' || /hydration/i.test(message.text())) {
      errors.push(message.text())
    }
  })
  await page.goto('/vapor-input-dom')
  for (const id of ['native-input', 'native-textarea']) {
    const section = page.getByTestId(id)
    await expect(section).toHaveAttribute('data-ready', 'true')
    const input = section.locator('input, textarea')
    await section.getByRole('button', { name: 'Focus', exact: true }).click()
    await expect(input).toBeFocused()
    await input.fill('changed')
    await section.getByRole('button', { name: 'Select', exact: true }).click()
    expect(await input.evaluate(element => element.selectionEnd - element.selectionStart)).toBe(7)
    await section.getByRole('button', { name: 'Blur', exact: true }).click()
    await expect(input).not.toBeFocused()
    await section.getByRole('button', { name: 'Clear', exact: true }).click()
    await expect(input).toHaveValue('')
  }
  await expect(page.getByTestId('native-value')).toHaveText('')
  const regular = page.getByTestId('regular-input')
  const label = regular.locator('label')
  for (const action of [null, 'resize-prepend', 'toggle-prepend', 'remount-inputs']) {
    if (action) {
      await page.getByTestId(action).click()
    }
    await expect.poll(async () => {
      const box = await label.boundingBox()
      const wrapper = await regular.locator('.input-wrapper__regular').boundingBox()

      return Math.abs(box.x - wrapper.x)
    }).toBeLessThan(2)
    await label.click()
    await expect(regular.locator('input')).toBeFocused()
  }
  for (const id of ['file-full', 'file-simple']) {
    const transfer = await page.evaluateHandle(() => {
      const data = new DataTransfer()
      data.items.add(new File(['test'], 'dropped.txt', { type: 'text/plain' }))

      return data
    })
    await page.getByTestId(id).locator('.wrapper').first().dispatchEvent('drop', { dataTransfer: transfer })
    await expect(page.getByTestId(id).locator('output')).toHaveText('dropped.txt')
    await transfer.dispose()
  }
  expect(errors).toEqual([])
})

test('server renders labels and native input values without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    const response = await page.goto(new URL('/vapor-input-dom', baseURL).href)
    expect(response.status()).toBe(200)
    await expect(page.locator('#native-input')).toHaveValue('initial')
    await expect(page.locator('#native-textarea')).toHaveValue('notes')
    await expect(page.getByTestId('regular-input').locator('label')).toHaveAttribute('for', 'regular-input')
  } finally {
    await context.close()
  }
})
