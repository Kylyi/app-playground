import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import { adaptVDOMDirectives } from './vdom-directives.mjs'

test('Button VDOM root lifecycle keeps a replacement root when the old root unmounts', () => {
  const source = readFileSync(new URL('../../packages/UI/app/components/Button/Btn.vue', import.meta.url), 'utf8')
  const { code, adapters } = adaptVDOMDirectives(source, 'UI/app/components/Button/Btn.vue')
  assert.equal(adapters.length, 2)
  assert.ok(code.includes('import { vRipple }'))
  assert.ok(!code.includes('vRippleVapor as vRipple'))
  const body = code.match(/const vRoot: ObjectDirective<HTMLButtonElement \| HTMLAnchorElement> = (\{[\s\S]*?\n\})/)[1]
  const element = { value: undefined }
  // Execute the emitted adapter, with its only external ref supplied explicitly.
  const directive = runInNewContext(`(${body})`, { element })
  const oldRoot = {}
  const nextRoot = {}
  directive.created(oldRoot)
  assert.equal(element.value, oldRoot)
  directive.created(nextRoot)
  directive.beforeUnmount(oldRoot)
  assert.equal(element.value, nextRoot)
  directive.beforeUnmount(nextRoot)
  assert.equal(element.value, undefined)
})

test('Chip selects the VDOM ripple and unrelated source remains byte-identical', () => {
  const source = readFileSync(new URL('../../packages/UI/app/components/Chip/Chip.vue', import.meta.url), 'utf8')
  const adapted = adaptVDOMDirectives(source, 'UI/app/components/Chip/Chip.vue')
  assert.equal(adapted.adapters.length, 1)
  assert.equal(adapted.code, source.replace('vRippleVapor as vRipple', 'vRipple'))
  assert.deepEqual(adaptVDOMDirectives(source, 'UI/app/components/Other.vue'), { code: source, adapters: [] })
})
