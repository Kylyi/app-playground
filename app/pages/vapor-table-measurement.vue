<script setup lang="ts">
import { TableColumn } from '#layers/ui/app/components/Table/models/table-column.model'

const width = ref('')

async function fitLegacyColumn() {
  const column = new TableColumn({ field: 'id', autofitLongestText: false })
  const row = { id: 1 }
  await column.autoFit({
    rows: [row, row],
    tableMinColWidth: 0,
    autofitConfig: { mode: 'fit' },
    ui: { cellClass: () => '' },
    slotRenderFnc: ({ index, refreshDataFnc }) => {
      refreshDataFnc()

      return h('span', { style: { width: index === 0 ? '123px' : '287px' } })
    },
  })
  width.value = column.width ?? ''
}
</script>

<template>
  <main>
    <VaporTableMeasurement />
    <button
      data-example-control
      @click="fitLegacyColumn"
    >
      Measure legacy column
    </button>
    <output data-testid="legacy-column-width">{{ width }}</output>
  </main>
</template>
