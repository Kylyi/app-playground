<script setup lang="ts" vapor>
import { TableColumn } from '#layers/ui/app/components/Table/models/table-column.model'
import Table from '#layers/ui/app/components/Table/Table.vue'
import type { TableExpose } from '#layers/ui/app/components/Table/functions/table-get-exposed'

defineOptions({ name: 'LegacyOrdersTableOwner' })
const columns = [new TableColumn({ field: 'id', label: 'ID' })]
const table = useTemplateRef<TableExpose>('table')
const ready = ref(false)
onMounted(() => ready.value = true)
const count = computed(() => table.value?.store().customData.value.count ?? 0)
function increment() {
  if (table.value) {
    table.value.store().customData.value.count = count.value + 1
  }
}
</script>

<template>
  <section data-testid="implicit-table">
    <Table
      ref="table"
      :columns
      :rows="[{ id: 1 }]"
      :features="[]"
      :auto-fit="{ onInit: false }"
      :modifiers="{ useUrl: false, autoSaveSchema: false }"
    />
    <output data-testid="saved-count">{{ ready ? count : 0 }}</output>
    <button
      data-example-control
      @click="increment"
    >
      Save implicit preference
    </button>
  </section>
</template>
