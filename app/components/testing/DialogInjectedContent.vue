<script lang="ts">
// Legacy API fixture: a VDOM render function, kept outside the Vapor owner.
export function LegacyDialogContent() {
  const message = inject<Ref<string>>('programmatic-dialog-message')

  return h('p', { 'data-testid': 'injected-dialog-content' }, message?.value)
}
export function LegacyDialogHeader(props: { hide: () => void }) {
  return h('div', [
    h('span', 'Legacy content'),
    h('button', {
      'type': 'button',
      'data-example-control': '',
      'onClick': props.hide,
    }, 'Close legacy header'),
  ])
}
</script>

<script setup lang="ts">
const message = inject<Ref<string>>('programmatic-dialog-message')
</script>

<template>
  <p data-testid="injected-dialog-content">
    {{ message }}
  </p>
</template>
