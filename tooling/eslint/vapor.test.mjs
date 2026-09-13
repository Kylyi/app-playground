import assert from 'node:assert/strict'
import { it } from 'node:test'
import { Linter } from 'eslint'
import vueParser from 'vue-eslint-parser'
import fc from 'fast-check'
import vapor from './vapor.mjs'

function lint(code, filename = 'probe.js') {
  return new Linter().verify(code, [{
    files: ['**/*.js', '**/*.vue'],
    languageOptions: filename.endsWith('.vue') ? { parser: vueParser } : {},
    plugins: { vapor },
    rules: { 'vapor/renderer-independent': 'error' },
  }], { filename })
}

it('leaves legacy code and explicit contracts alone', () => {
  assert.equal(lint('const el = getCurrentInstance().vnode.el').length, 0)
  assert.equal(lint('// @vapor-ready\nuseVModel(props, "value", emit); element.focus()').length, 0)
  assert.equal(lint('<script setup>getCurrentInstance()</script><template><div @vue:mounted="ready" /></template>', 'probe.vue').length, 0)
})

it('rejects instance access even when imports are renamed', () => {
  fc.assert(fc.property(fc.integer({ min: 0, max: 100000 }), id => {
    const code = `// @vapor-ready\nimport { getCurrentInstance as instance${id} } from 'vue'; instance${id}()`
    assert.deepEqual(lint(code).map(message => message.messageId), ['instance'])
  }), { seed: 20260905, numRuns: 50 })
})

it('detects namespace calls, optional/computed internals and implicit emits', () => {
  const code = '// @vapor-ready\nimport * as Vue from "vue"; Vue.getCurrentInstance(); ref?.["$el"]; useVModel(props, "value"); useVModels(props, undefined)'
  assert.deepEqual(lint(code).map(message => message.messageId), ['instance', 'member', 'model', 'model'])
})

it('checks Vapor scripts and per-element lifecycle events', () => {
  const code = '<script setup vapor>getCurrentInstance()</script><template><div @vue:mounted="ready" /></template>'
  assert.deepEqual(lint(code, 'probe.vue').map(message => message.messageId), ['instance', 'lifecycle'])
})
