// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createVaporApp, nextTick, ref } from 'vue'
import type { useRenderTemporaryTableCell } from '../../packages/UI/app/components/Table/composables/useRenderTemporaryTableCell'
import type { TableColumn } from '../../packages/UI/app/components/Table/models/table-column.model'
import VaporNativeTableMeasurement from '../fixtures/VaporNativeTableMeasurement.vue'

vi.mock('../../packages/Utilities/app/composables/useLocale', () => ({
  useLocale: () => ({ currentLocaleCode: ref('cs-CZ') }),
}))

const disposers: Array<() => void> = []
afterEach(() => {
  disposers.splice(0).forEach(dispose => dispose())
  vi.restoreAllMocks()
})

function mountMeasurement() {
  const container = document.createElement('div')
  document.body.append(container)
  // No vaporInteropPlugin: an accidental VDOM boundary must fail this test.
  const app = createVaporApp(VaporNativeTableMeasurement)
  const owner = app.mount(container) as unknown as {
    measurements: ReturnType<typeof useRenderTemporaryTableCell>
    col: TableColumn
    active: number
  }
  disposers.push(() => {
    app.unmount()
    container.remove()
  })

  return { owner, app, container }
}

describe('table measurement without VDOM interop', () => {
  it('renders native scoped slots with local providers and disposes each measurement', async () => {
    const { owner, container } = mountMeasurement()
    const observedWidths: string[] = []
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const content = this.querySelector<HTMLElement>('[data-measured-content]')!
      observedWidths.push(content.style.width)

      return new DOMRect(0, 0, Number.parseFloat(content.style.width), 20)
    })
    const results = await Promise.all([123, 287].map(width => owner.measurements.getCellWidth({
      row: { width },
      col: owner.col,
    })))
    expect(results).toEqual([173, 337])
    expect(observedWidths).toEqual(['173px', '337px'])
    expect(container.querySelector('[data-table-measurement]')).toBeNull()
    expect(owner.active).toBe(0)
  })

  it('settles pending measurements without a width when the native owner unmounts', async () => {
    const { owner, app, container } = mountMeasurement()
    const initialWidth = owner.col.width
    const pending = owner.measurements.getCellWidth({ row: { width: 123 }, col: owner.col })
    const autofit = owner.col.autoFit({
      rows: [{ width: 287 }],
      measurements: owner.measurements,
      tableMinColWidth: 40,
    })
    app.unmount()
    await expect(pending).resolves.toBeUndefined()
    await autofit
    expect(owner.col.width).toBe(initialWidth)
    await nextTick()
    expect(container.innerHTML).toBe('')
    expect(owner.measurements.requests.value).toEqual([])
    await expect(owner.measurements.getHeaderWidth(owner.col)).resolves.toBeUndefined()
    disposers.pop()
    container.remove()
  })
})
