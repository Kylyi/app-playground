import { expect, test } from '@playwright/test'
import { assertRendererDiagnostics, createObservedContext } from './renderer-diagnostics.mjs'

assertRendererDiagnostics(test)

async function dropFile(folder, name) {
  await folder.evaluate((el, name) => {
    const transfer = new DataTransfer()
    transfer.items.add(new File(['contents'], name, { type: 'text/plain' }))
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
}

test('a file drop resolving after the DMS owner unmounts cannot mutate the retained model', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-tree-dms-drop')
  await expect(page.getByTestId('tree-dms-drop')).toHaveAttribute('data-ready', 'true')
  const initial = await page.getByTestId('dms-items').textContent()
  await page.getByRole('button', { name: 'Toggle delayed drop', exact: true }).click()
  await dropFile(page.locator('.tree-node[data-id="folder"]'), 'late.txt')
  await expect(page.getByTestId('drop-progress')).toHaveText('1 / 0')
  await page.getByRole('button', { name: 'Toggle DMS', exact: true }).click()
  await expect(page.locator('.tree-node')).toHaveCount(0)
  await page.getByRole('button', { name: 'Complete drop', exact: true }).click()
  await expect(page.getByTestId('drop-progress')).toHaveText('1 / 1')
  await expect(page.getByTestId('dms-items')).toHaveText(initial)
  await page.getByRole('button', { name: 'Toggle DMS', exact: true }).click()
  await expect(page.locator('.tree-node[data-id="folder"]')).toBeVisible()
  await expect(page.getByText('late.txt', { exact: true })).toHaveCount(0)
})

test('the public DMS store starts a rename, preserves live edits and abandons delayed edits after unmount', async ({ page }) => {
  await page.goto('/cs-CZ/vapor-tree-dms-drop')
  await expect(page.getByTestId('tree-dms-drop')).toHaveAttribute('data-ready', 'true')
  const folder = page.locator('.folder__name')
  await page.getByRole('button', { name: 'Rename folder', exact: true }).click()
  await expect(folder).toHaveAttribute('contenteditable', 'true')
  await folder.fill('Renamed documents')
  await folder.press('Enter')
  await expect(page.getByTestId('dms-items')).toContainText('Renamed documents')
  const saved = await page.getByTestId('dms-items').textContent()
  await page.getByRole('button', { name: 'Toggle delayed drop', exact: true }).click()
  await page.getByRole('button', { name: 'Rename folder', exact: true }).click()
  await folder.fill('Late rename')
  await folder.press('Enter')
  await expect(page.getByTestId('drop-progress')).toHaveText('2 / 1')
  await page.getByRole('button', { name: 'Toggle DMS', exact: true }).click()
  await page.getByRole('button', { name: 'Complete drop', exact: true }).click()
  await expect(page.getByTestId('drop-progress')).toHaveText('2 / 2')
  await expect(page.getByTestId('dms-items')).toHaveText(saved)
  await page.getByRole('button', { name: 'Toggle DMS', exact: true }).click()
  await expect(folder).toHaveText('Renamed documents')
})

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
  const context = await createObservedContext(browser, { baseURL, javaScriptEnabled: false })
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
