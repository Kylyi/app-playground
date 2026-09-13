<script setup lang="ts" vapor>
import VaporListDragRow from './VaporListDragRow.vue'

const virtual = useRoute().query.virtual === 'true'
const items = ref([
  { id: 0, label: 'Alpha' },
  { id: 1, label: 'Beta' },
  { id: 2, label: 'Gamma' },
  ...Array.from({ length: virtual ? 997 : 0 }, (_, index) => ({
    id: index + 3,
    label: `Item ${index + 4}`,
  })),
])
const mounted = ref(true)
const alternateRoot = ref(false)
provide('list-drag-test-root', alternateRoot)
const customHandle = ref(false)
const dragAllowed = ref(true)
const moves = ref(0)
const ready = ref(false)
onMounted(() => ready.value = true)
</script>

<template>
  <section
    :data-ready="ready"
    data-testid="list-drag"
  >
    <button
      data-example-control
      @click="customHandle = !customHandle"
    >
      Switch handle
    </button>
    <button
      data-example-control
      @click="mounted = !mounted"
    >
      Toggle list
    </button>
    <button
      data-example-control
      @click="alternateRoot = !alternateRoot"
    >
      Replace row roots
    </button>
    <button
      data-example-control
      @click="dragAllowed = !dragAllowed"
    >
      Toggle drag permission
    </button>
    <p>
      Records: <output
        data-example-output
        aria-label="Drag count"
        data-testid="drag-count"
      >{{ items.length }}</output>
    </p>
    <p>
      First three:
      <output
        data-example-output
        aria-label="Drag order"
        data-testid="drag-order"
      >{{ items.slice(0, 3).map(item => item.label).join(',') }}</output>
    </p>
    <output
      data-example-output
      aria-label="Drag moves"
      data-testid="drag-moves"
    >{{ moves }}</output>
    <List
      v-if="mounted"
      :key="`${customHandle}-${alternateRoot}`"
      v-model:items="items"
      :reorderable="() => dragAllowed"
      :row-component="VaporListDragRow"
      :search-config="{ enabled: false }"
      :sorting-config="{ enabled: false }"
      :scroller-config="{ threshold: virtual ? 0 : 100 }"
      :move-handle-target="customHandle ? '.custom-handle' : undefined"
      :ui="{ containerStyle: () => ({ width: '300px', height: '200px' }) }"
      @move:item="moves++"
    >
      <template #item="{ row }">
        <button
          class="custom-handle"
        >
          {{ row.label }}
        </button>
      </template>
    </List>
  </section>
</template>
