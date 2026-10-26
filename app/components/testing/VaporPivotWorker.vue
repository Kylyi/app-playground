<script setup lang="ts" vapor>
import { PivotItem } from '#layers/ui/app/components/Pivot/models/pivot-item.model'

const visible = ref(true)
const ready = ref(false)
const rows = shallowRef(Array.from({ length: 2000 }, (_, id) => ({
  id,
  name: `Worker record ${id}`,
  group: `Group ${id % 20}`,
  value: id + 1,
})))
const revision = ref(0)
const items = [
  new PivotItem({ field: 'name', usage: { row: { index: 0 } } }),
  new PivotItem({ field: 'group', usage: { column: { index: 0 } } }),
  new PivotItem({ field: 'value', dataType: 'number', usage: { value: [{ index: 0, summaryType: SummaryEnum.SUM }] } }),
]
function updateData() {
  revision.value++
  rows.value = rows.value.map(row => ({ ...row, name: `Worker record ${row.id} revision ${revision.value}` }))
}
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="pivot-worker-example"
    :data-ready="ready"
    flex="~ col gap-3"
  >
    <button
      data-example-control
      @click="visible = !visible"
    >
      Toggle worker Pivot
    </button>
    <button
      data-example-control
      @click="updateData"
    >
      Replace worker Pivot data
    </button>
    <Pivot
      v-if="visible"
      :data="rows"
      :items
      :ui="{ containerStyle: () => ({ width: '640px', height: '320px' }) }"
      data-testid="worker-pivot"
    />
  </section>
</template>
