// @vitest-environment happy-dom
import { expect, it } from 'vitest'
import { createApp, createVaporApp, defineComponent, h, vaporInteropPlugin } from 'vue'
import VaporTableStorageProbe from '../fixtures/VaporTableStorageProbe.vue'
import VaporTableStorageParent from '../fixtures/VaporTableStorageParent.vue'

it('resolves the immediate owner in both pure Vapor and VDOM render functions', () => {
  const native = createVaporApp(VaporTableStorageParent)
  const mixed = createApp(defineComponent({ name: 'InvoiceDetails', setup: () => () => h(VaporTableStorageProbe) }))
  mixed.use(vaporInteropPlugin)
  for (const [app, owner] of [[native, 'InvoicesByClient'], [mixed, 'InvoiceDetails']] as const) {
    const container = document.createElement('div')
    app.mount(container)
    try {
      expect(container.textContent).toBe(owner)
    } finally {
      app.unmount()
    }
  }
})
