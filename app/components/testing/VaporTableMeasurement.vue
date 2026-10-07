<script setup lang="ts" vapor>
import { TableColumn } from '../../../packages/UI/app/components/Table/models/table-column.model'
import { useRenderTemporaryTableCell } from '../../../packages/UI/app/components/Table/composables/useRenderTemporaryTableCell'
import TableMeasurement from '../../../packages/UI/app/components/Table/TableMeasurement.vue'
import TemporaryMeasurementContent from './TemporaryMeasurementContent.vue'

const measurements = useRenderTemporaryTableCell()
const { requests, getCellWidth, getHeaderWidth } = measurements
const col = new TableColumn({ field: 'width', label: 'Measured column', dataType: 'number' })
const ready = ref(false)
const result = ref('pending')
const runs = ref(0)
const offset = ref(0)
const active = ref(0)
const measurementActive = ref(0)
const table = useTemplateRef('table')
const tableMounted = ref(true)
const fitState = ref('pending')
const cancelledWidths = ref('pending')
const route = useRoute()
const forced = route.query.mode === 'autofit'
const rows = [
  { id: 1, width: 123, text: 'Short text', enabled: true },
  { id: 2, width: 287, text: 'A much longer text value', enabled: false },
]
const columns = [
  new TableColumn({ field: 'width', label: 'Width', width: '90px', autofitLongestText: false }),
  new TableColumn({ field: 'text', label: 'Longer text heading', width: '90px' }),
  new TableColumn({ field: 'enabled', label: 'Enabled', dataType: 'boolean', width: '90px' }),
]
const plainCol = new TableColumn({ field: 'width', dataType: 'number' })
const noPadding = { cellClass: () => '' }
provide('table-measurement-context', { offset, active, measurementActive })
onMounted(() => ready.value = true)

// Calling the API on the server must neither render temporary content nor alter widths.
if (import.meta.server) {
  void getCellWidth({ row: rows[0]!, col })
}

async function measure() {
  try {
    const widths = await Promise.all([123, 287].map(width => getCellWidth({
      row: { width },
      col,
      ui: noPadding,
    })))
    const header = await getHeaderWidth(col)
    const plain = await getCellWidth({ row: { width: 42 }, col: plainCol })
    const boolean = await getCellWidth({
      row: { enabled: true },
      col: columns[2]!,
    })
    result.value = JSON.stringify({ widths, header, plain, boolean })
  } catch (error) {
    result.value = error instanceof Error ? error.message : String(error)
  } finally {
    runs.value++
  }
}

async function fit(remove = false, mode: 'fit-with-header' | 'stretch' = 'fit-with-header') {
  fitState.value = 'fitting'
  const store = table.value?.store()
  const before = store?.internalColumns.value.map(col => col.width)
  const pending = table.value?.fitColumns(undefined, { mode })
  if (remove) {
    tableMounted.value = false
  }
  await pending
  if (remove) {
    cancelledWidths.value = JSON.stringify({
      before,
      after: store?.internalColumns.value.map(col => col.width),
    })
  }
  fitState.value = remove ? 'removed' : 'fitted'
}
</script>

<template>
  <section
    data-testid="table-measurement"
    :data-ready="ready"
    :data-active="active"
    :data-measurement-active="measurementActive"
    flex="~ col gap-4"
  >
    <div flex="~ gap-2 wrap">
      <button
        data-example-control
        type="button"
        @click="measure"
      >
        Measure concurrent cells
      </button>
      <button
        data-example-control
        type="button"
        @click="offset += 50"
      >
        Increase content width
      </button>
      <button
        data-example-control
        type="button"
        @click="fit()"
      >
        Fit table
      </button>
      <button
        data-example-control
        type="button"
        @click="fit(true)"
      >
        Fit and remove table
      </button>
      <button
        data-example-control
        type="button"
        @click="fit(true, 'stretch')"
      >
        Stretch and remove table
      </button>
      <button
        data-example-control
        type="button"
        @click="tableMounted = !tableMounted"
      >
        Toggle table
      </button>
    </div>
    <output
      data-example-output
      aria-label="Measurement result"
      data-testid="measurement-result"
      :data-runs="runs"
    >{{ result }}</output>
    <output data-testid="fit-state">{{ fitState }}</output>
    <output data-testid="cancelled-widths">{{ cancelledWidths }}</output>
    <TableMeasurement
      v-for="request in requests"
      :key="request.id"
      :request
      @ready="element => measurements.setElement(request.id, element)"
    >
      <template
        v-if="request.kind === 'cell' && request.col === col"
        #default="{ row }"
      >
        <TemporaryMeasurementContent :width="row.width" />
      </template>
    </TableMeasurement>
    <div
      data-testid="measured-table"
      h="100"
    >
      <Table
        v-if="tableMounted"
        ref="table"
        :rows
        :columns
        :features="['autofit']"
        :auto-fit="{ onInit: forced ? 'forced' : false, mode: 'fit-with-header' }"
        :minimum-column-width="40"
        :breakpoint="0"
        :split-rows="[]"
      >
        <template #width="{ row, column, value, index, customData }">
          <TemporaryMeasurementContent
            :width="row.width"
            :data-slot-contract="`${column.field}:${value}:${index}:${typeof customData}`"
          />
        </template>
      </Table>
    </div>
  </section>
</template>
