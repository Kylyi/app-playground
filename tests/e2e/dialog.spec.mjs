import { expect, test } from '@playwright/test'

test('default dialog is centered in the viewport', async ({ page }) => {
  await page.goto('/cs-CZ/')
  await expect(page.getByTestId('prepend-preview')).toHaveAttribute('data-ready', 'true')
  await page.getByRole('button', { name: 'Dialog', exact: true }).click()
  const dialog = page.locator('.dialog__wrapper:visible .dialog')
  await expect(dialog).toBeVisible()
  await expect.poll(async () => dialog.evaluate(el => {
    const box = el.getBoundingClientRect()
    const wrapper = el.parentElement
    const style = getComputedStyle(wrapper)

    return {
      position: wrapper.getAttribute('position'),
      justify: style.justifyContent,
      align: style.alignItems,
      centered: Math.abs(box.x + box.width / 2 - innerWidth / 2) < 2
        && Math.abs(box.y + box.height / 2 - innerHeight / 2) < 2,
    }
  })).toMatchObject({ position: 'center', centered: true })
})
