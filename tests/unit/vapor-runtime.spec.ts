// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVaporApp, defineComponent, h, nextTick, ref, vaporInteropPlugin } from 'vue'
import VaporUnitCounter from '../fixtures/VaporUnitCounter.vue'

const disposers: Array<() => void> = []
afterEach(() => disposers.splice(0).forEach(dispose => dispose()))

describe('native Vapor unit runtime', () => {
  it('mounts compiled Vapor, updates native events and removes DOM on unmount', async () => {
    const container = document.createElement('div')
    document.body.append(container)
    const app = createVaporApp(VaporUnitCounter)
    app.mount(container)
    disposers.push(() => {
      app.unmount()
      container.remove()
    })
    expect(container.querySelector('output')?.textContent).toBe('0')
    container.querySelector('button')!.click()
    await nextTick()
    expect(container.querySelector('output')?.textContent).toBe('1')
    app.unmount()
    expect(container.innerHTML).toBe('')
    container.remove()
    disposers.pop()
  })

  it('shares refs, models and scoped slots across a test-utils VDOM owner and Vapor child', async () => {
    const model = ref(2)
    const wrapper = mount(defineComponent({
      setup: () => () => h('div', [h(VaporUnitCounter, {
        'modelValue': model.value,
        'onUpdate:modelValue': (value: number) => model.value = value,
      }, { default: ({ value }: { value: number }) => h('output', `Slot ${value}`) })]),
    }), { attachTo: document.body, global: { plugins: [vaporInteropPlugin] } })
    disposers.push(() => wrapper.unmount())
    expect(wrapper.get('output').text()).toBe('Slot 2')
    await wrapper.get('button').trigger('click')
    expect(model.value).toBe(3)
    expect(wrapper.get('output').text()).toBe('Slot 3')
    model.value = 8
    await nextTick()
    expect(wrapper.get('button').text()).toBe('Increment 8')
    expect(wrapper.get('output').text()).toBe('Slot 8')
  })
})
