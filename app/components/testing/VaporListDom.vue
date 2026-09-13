<script setup lang="ts" vapor>
const empty = ref(true)
const wide = ref(false)
const ready = ref(false)
const contentSize = ref({ height: 0, width: 0 })
const items = Array.from({ length: 40 }, (_, index) => ({ id: index + 1, label: `Item ${index + 1}` }))

onMounted(() => {
  ready.value = true
})
</script>

<template>
  <section
    :data-ready="ready"
    data-testid="list-dom"
  >
    <button
      data-example-control
      @click="empty = !empty"
    >
      Toggle items
    </button>
    <button
      data-example-control
      @click="wide = !wide"
    >
      Resize empty state
    </button>
    <output
      data-example-output
      aria-label="Empty size"
      data-testid="empty-size"
    >{{ JSON.stringify(contentSize) }}</output>
    <List
      :items="empty ? [] : items"
      :search-config="{ enabled: false }"
      :sorting-config="{ enabled: false }"
      :scroller-config="{ threshold: 10, rowHeight: 36 }"
      :ui="{
        containerStyle: () => ({ width: wide ? '360px' : '240px', height: '180px' }),
        noDataStyle: () => ({ height: '48px' }),
      }"
      @change:content-size="contentSize = $event"
    >
      <template #item="{ row }">
        <button data-example-control>
          {{ row.label }}
        </button>
      </template>
    </List>
  </section>
</template>
