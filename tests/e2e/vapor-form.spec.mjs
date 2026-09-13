import { expect, test } from '@playwright/test'

function field(form, name) {
  return form.getByTestId(`${name}-field`)
}

async function expectInvalid(form) {
  for (const name of ['name', 'city', 'zip']) {
    await expect(field(form, name).locator('.has-error')).toHaveCount(1)
    await expect(field(form, name).locator('span.align-middle')).toBeVisible()
    await expect(field(form, name).locator('span.align-middle')).not.toHaveText('')
  }
}

async function fillValid(form) {
  await field(form, 'name').getByRole('textbox').fill('Jan Novák')
  await field(form, 'city').getByRole('textbox').fill('Praha')
  await field(form, 'zip').getByRole('textbox').fill('11000')
}

for (const [engine, route] of [['ArkType', '/vapor-form'], ['Zod', '/vapor-form-zod']]) {
  test.describe(engine, () => {
    test('Form validates nested schema paths, isolates scopes and submits the actual model', async ({ page }) => {
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('console', message => {
        if (message.type() === 'error' || /hydration/i.test(message.text())) {
          errors.push(message.text())
        }
      })
      await page.goto(route)
      await expect(page.getByTestId('vapor-form-page')).toHaveAttribute('data-ready', 'true')
      const base = page.getByTestId('form-base')
      const billing = page.getByTestId('form-billing')
      await expect(page.locator('.has-error')).toHaveCount(0)
      await base.getByRole('button', { name: 'Uložit', exact: true }).click()
      await expectInvalid(base)
      await expect(base.getByTestId('submissions')).toHaveText('0')
      await expect(billing.locator('.has-error')).toHaveCount(0)

      // Changing one nested path must not clear its sibling's error.
      await field(base, 'city').getByRole('textbox').fill('Praha')
      await expect(field(base, 'city').locator('.has-error')).toHaveCount(0)
      await expect(field(base, 'zip').locator('.has-error')).toHaveCount(1)
      await fillValid(base)
      await expect(base.locator('.has-error')).toHaveCount(0)
      await base.getByRole('button', { name: 'Uložit', exact: true }).click()
      await expect(base.getByTestId('submissions')).toHaveText('1')
      await expect(base.getByTestId('submitted')).toHaveText(JSON.stringify({
        name: 'Jan Novák',
        address: { city: 'Praha', zip: '11000' },
      }))
      await billing.getByRole('button', { name: 'Uložit', exact: true }).click()
      await expectInvalid(billing)
      await expect(billing.getByTestId('submissions')).toHaveText('0')
      await expect(base.locator('.has-error')).toHaveCount(0)
      await fillValid(billing)
      await billing.getByRole('button', { name: 'Uložit', exact: true }).click()
      await expect(billing.getByTestId('submissions')).toHaveText('1')
      await expect(billing.getByTestId('submitted')).toHaveText(await base.getByTestId('submitted').textContent())
      expect(errors).toEqual([])
    })

    test('scope reset preserves values and other errors; remount removes stale registrations', async ({ page }) => {
      await page.goto(route)
      await expect(page.getByTestId('vapor-form-page')).toHaveAttribute('data-ready', 'true')
      const base = page.getByTestId('form-base')
      const billing = page.getByTestId('form-billing')
      await field(billing, 'name').getByRole('textbox').fill('X')
      for (const form of [base, billing]) {
        await form.getByRole('button', { name: 'Uložit', exact: true }).click()
        await expectInvalid(form)
      }
      await billing.getByRole('button', { name: 'Skrýt chyby tohoto scope' }).click()
      await expect(billing.locator('.has-error')).toHaveCount(0)
      await expect(field(billing, 'name').getByRole('textbox')).toHaveValue('X')
      await expectInvalid(base)
      await billing.getByRole('button', { name: 'Uložit', exact: true }).click()
      await expectInvalid(billing)
      await expect(page.getByTestId('registrations')).toHaveText('2')
      for (let cycle = 0; cycle < 2; cycle++) {
        await page.getByTestId('toggle-billing').click()
        await expect(billing).toHaveCount(0)
        await expect(page.getByTestId('registrations')).toHaveText('1')
        await expectInvalid(base)
        await page.getByTestId('toggle-billing').click()
        await expect(page.getByTestId('registrations')).toHaveText('2')
        await expect(field(billing, 'name').getByRole('textbox')).toHaveValue('X')
      }
      await fillValid(billing)
      await billing.getByRole('button', { name: 'Uložit', exact: true }).click()
      await expect(billing.getByTestId('submissions')).toHaveText('1')
      await expect(billing.locator('.has-error')).toHaveCount(0)
      await expectInvalid(base)
    })

    test('both Forms and nested fields render on the server without JavaScript', async ({ browser, baseURL }) => {
      const context = await browser.newContext({ javaScriptEnabled: false })
      try {
        const page = await context.newPage()
        const response = await page.goto(new URL(route, baseURL).href)
        expect(response.status()).toBe(200)
        for (const scope of ['base', 'billing']) {
          const form = page.getByTestId(`form-${scope}`)
          for (const name of ['name', 'city', 'zip']) {
            await expect(field(form, name).getByRole('textbox')).toBeVisible()
          }
          await expect(form.getByRole('button', { name: 'Uložit', exact: true })).toBeVisible()
        }
        await expect(page.locator('.has-error')).toHaveCount(0)
      } finally {
        await context.close()
      }
    })
  })
}
