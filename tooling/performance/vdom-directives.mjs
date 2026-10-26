import assert from 'node:assert/strict'

/** Select the existing VDOM directive contract when removing SFC markers. */
export function adaptVDOMDirectives(source, file) {
  const adapters = []
  let code = source
  if (['UI/app/components/Button/Btn.vue', 'UI/app/components/Chip/Chip.vue'].includes(file)) {
    const nativeImport = 'import { vRippleVapor as vRipple }'
    assert.ok(code.includes(nativeImport), `${file}: audit the ripple adapter before changing this control`)
    code = code.replace(nativeImport, 'import { vRipple }')
    adapters.push('Existing VDOM ripple export: same listener, enabled state and animation cleanup')
  }
  if (file === 'UI/app/components/Button/Btn.vue') {
    code = code.replace('CSSProperties, VaporDirective', 'CSSProperties, ObjectDirective')
    const nativeRoot = /const vRoot: VaporDirective<HTMLButtonElement \| HTMLAnchorElement> = el => \{[\s\S]*?\n\}/
    assert.match(code, nativeRoot)
    code = code.replace(nativeRoot, `const vRoot: ObjectDirective<HTMLButtonElement | HTMLAnchorElement> = {
  created(el) {
    element.value = el
  },
  beforeUnmount(el) {
    if (element.value === el) {
      element.value = undefined
    }
  },
}`)
    adapters.push('VDOM root directive: assign on creation and release before unmount')
  }

  return { code, adapters }
}
