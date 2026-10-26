<script setup lang="ts">
// Preserve a VDOM root owner as a consumer regression for Vapor's styled viewport.
const scroller = useTemplateRef('scroller')
const rows = Array.from({ length: 100 }, (_, id) => ({ id, label: `Mixed row ${id}` }))
const ready = ref(false)
const elementMatches = ref(false)
const startIndex = ref(-1)

onMounted(() => {
  elementMatches.value = scroller.value?.element?.matches('[data-testid="mixed-scroller"]') ?? false
  ready.value = true
})

function activateRow(id: number) {
  scroller.value?.focus()
  scroller.value?.scrollTo(id === 0 ? 60 : 0)
}
</script>

<template>
  <VirtualScroller
    ref="scroller"
    data-testid="mixed-scroller"
    :data-ready="ready"
    :data-element-matches="elementMatches"
    :data-start-index="startIndex"
    :rows
    :row-height="48"
    :threshold="10"
    :initial-rows-render-count="8"
    :overscan="{ top: 32, bottom: 96 }"
    :ui="{ containerStyle: () => ({ height: '220px', width: '320px', maxWidth: '100%' }) }"
    @virtual-scroll="startIndex = $event.visibleStartItem.index"
  >
    <template #default="{ row }">
      <button
        data-example-control
        type="button"
        @click="activateRow(row.id)"
      >
        {{ row.label }}
      </button>
    </template>
  </VirtualScroller>
</template>
