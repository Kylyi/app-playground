<script setup lang="ts" vapor>
import { TableColumn } from '../../../packages/UI/app/components/Table/models/table-column.model'

const table = useTemplateRef('table')
const mounted = ref(true)
const ready = ref(false)
const columns = Array.from({ length: 80 }, (_, index) => new TableColumn({
  field: `field_${index}`,
  label: `Column ${index}`,
  width: `${120 + index % 3 * 40}px`,
}))
const rows = Array.from({ length: 1000 }, (_, id) => ({
  id,
  ...Object.fromEntries(columns.map((column, index) => [column.field, `Row ${id} · Col ${index}`])),
}))
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="virtual-grid-example"
    :data-ready="ready"
  >
    <button
      data-example-control
      @click="table?.getVirtualScroller()?.scrollToCell({ rowIndex: 500, columnIndex: 60 })"
    >
      Go to row 500, column 60
    </button>
    <button
      data-example-control
      @click="table?.getVirtualScroller()?.scrollToCell({ rowIndex: 0, columnIndex: 0 })"
    >
      Go to origin
    </button>
    <button
      data-example-control
      @click="mounted = !mounted"
    >
      Toggle grid
    </button>
    <Table
      v-if="mounted"
      ref="table"
      :columns
      :rows
      :storage-key="null"
      :features="[]"
      :breakpoint="1"
      :split-rows="[]"
      :auto-fit="{ onInit: false }"
      :modifiers="{ useUrl: false, autoSaveSchema: false }"
      :scroller-config="{
        virtualizeColumns: true,
        rowHeight: 32,
        initialRowsRenderCount: 8,
        overscan: { top: 64, bottom: 96 },
      }"
      :ui="{ containerClass: ({ defaults }) => [defaults.all, 'w-900px h-420px'] }"
    />
  </section>
</template>
