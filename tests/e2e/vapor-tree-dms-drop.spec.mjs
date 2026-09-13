import { expect, test } from '@playwright/test'

test('external files keep their folder target across RAF and remount', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/vapor-tree-dms-drop')
  await expect(page.getByTestId('tree-dms-drop')).toHaveAttribute('data-ready', 'true')
  for (const name of ['first.txt', 'second.txt']) {
    const folder = page.locator('.tree-node[data-id="folder"]')
    await expect(folder).toBeVisible()
    await folder.evaluate((el, name) => {
      const file = new File(['contents'], name, { type: 'text/plain' })
      const transfer = new DataTransfer()
      transfer.items.add(file)
      // Synthetic transfers do not expose OS file entries; provide the browser entry boundary.
      const original = DataTransferItem.prototype.webkitGetAsEntry
      DataTransferItem.prototype.webkitGetAsEntry = function () {
        const source = this.getAsFile()

        return { isFile: true, isDirectory: false, name: source.name, file: resolve => resolve(source) }
      }
      const rect = el.getBoundingClientRect()
      const options = { bubbles: true, cancelable: true, dataTransfer: transfer, clientX: rect.x + 25, clientY: rect.y + 15 }
      try {
        el.dispatchEvent(new DragEvent('dragover', options))
        el.dispatchEvent(new DragEvent('drop', options))
      } finally {
        DataTransferItem.prototype.webkitGetAsEntry = original
      }
    }, name)
    await expect.poll(async () => {
      const items = JSON.parse(await page.getByTestId('dms-items').textContent())

      return items[0].children.map(item => item.name)
    }).toContain(name)
    await page.getByRole('button', { name: 'Toggle DMS' }).click()
    await expect(page.locator('.tree-node')).toHaveCount(0)
    await page.getByRole('button', { name: 'Toggle DMS' }).click()
  }
  expect(errors).toEqual([])
})

test('TreeDms renders on the server and has localized navigation', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/cs-CZ/vapor-tree-dms-drop')
    await expect(page.getByText('Documents', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'TreeDms · externí soubory', exact: true }))
      .toHaveAttribute('href', '/cs-CZ/vapor-tree-dms-drop')
  } finally {
    await context.close()
  }
})
