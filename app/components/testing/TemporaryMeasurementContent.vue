<script lang="ts">
import { h } from 'vue'

// Legacy VDOM slot contract used by Table's autofit measurement.
export function measurementSlot({ row }: { row: { width: number } }) {
  return h('div', { style: { width: `${row.width}px` } }, 'Measured content')
}

export default {}
</script>

<template>
  <span>Temporary content</span>
</template>
