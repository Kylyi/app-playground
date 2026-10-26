<script setup lang="ts" vapor>
import { ComparatorEnum } from '$comparatorEnum'
import { FilterItem } from '../../../packages/Utilities/app/models/filter-item.model'
import { TableColumn } from '../../../packages/UI/app/components/Table/models/table-column.model'
import { PivotItem } from '../../../packages/UI/app/components/Pivot/models/pivot-item.model'
import type { TableFeature } from '../../../packages/UI/app/components/Table/types/table-feature.type'
import type { ITableTotal } from '../../../packages/UI/app/components/Table/types/table-total.type'
import type { IPivotCellClickPayload } from '../../../packages/UI/app/components/Pivot/types/pivot-emits.type'

const route = useRoute()
const { currentLocaleCode } = useLocale()
const controls = route.query.controls === 'true'
const empty = route.query.empty === 'true'
const grouped = route.query.grouped === 'true'
const cellContracts = route.query.cells === 'true'
const formatVersion = ref(0)
const valuesOnRows = ref(false)
const clickMode = ref(0)
const lastCell = ref('')
const controlFeature = typeof route.query.feature === 'string'
  ? route.query.feature as TableFeature
  : undefined
const table = useTemplateRef('table')
const mounted = ref(true)
const wrapperMounted = ref(true)
const ready = ref(false)
const pivotRowClicks = ref(0)
const pivotCellClicks = ref(0)
const configVersion = ref(0)
const selection = ref<unknown[]>([])
const selectAllCalls = ref<unknown[][]>([])

function handleSelectAll(rows: unknown[]) {
  selectAllCalls.value.push(rows)
}
const rows = Array.from({ length: 100 }, (_, id) => ({ id, name: `Item ${id}`, group: `Group ${id % 8}`, value: id + 1 }))
const cellRows = ref(rows)
const tableRows = empty ? [] : rows
const columns = ['name', 'group', 'value'].map(field => new TableColumn({
  field,
  label: field,
  width: '320px',
  filters: controls && field === 'name'
    ? [new FilterItem({ field, comparator: ComparatorEnum.EQUAL, value: empty ? 'Missing item' : 'Item 4' })]
    : [],
}))
const features: TableFeature[] = controls
  ? ['search', 'export', 'autofit', ...(controlFeature ? [controlFeature] : [])]
  : ['search', 'export', 'autofit']
const totals: ITableTotal[] = [{ field: 'value', label: 'Total', dataType: 'number', value: 5050 }]
const items = grouped
  ? [
      new PivotItem({ field: 'group', usage: { row: { index: 0 } } }),
      new PivotItem({ field: 'name', usage: { row: { index: 1 } } }),
      new PivotItem({ field: 'value', dataType: 'number', usage: { value: [{ index: 0, summaryType: SummaryEnum.SUM }] } }),
    ]
  : [
      new PivotItem({ field: 'name', usage: { row: { index: 0 } } }),
      new PivotItem({ field: 'group', usage: { column: { index: 0 } } }),
      new PivotItem({ field: 'value', dataType: 'number', usage: { value: [{ index: 0, summaryType: SummaryEnum.SUM }] } }),
    ]
if (cellContracts) {
  const value = items.find(item => item.field === 'value')!
  value.format = (_row: unknown, aggregate?: unknown) => {
    return `Format ${formatVersion.value % 2 ? 'B' : 'A'} ${currentLocaleCode.value}: ${aggregate}`
  }
  items.push(new PivotItem({
    field: 'id',
    label: 'ID value',
    dataType: 'number',
    usage: { value: [{ index: 1, summaryType: SummaryEnum.SUM }] },
  }))
}

function handlePivotCellClick(payload: IPivotCellClickPayload) {
  pivotCellClicks.value++
  lastCell.value = `${payload.row.label}:${payload.cell.aggregated}:${payload.column.id === payload.cell.columnId}`
}

const loadData = route.query.loading
  ? {
      immediate: route.query.loading === 'immediate',
      fnc: async () => {
        // Make the initial loading state visible in this playground example.
        await new Promise(resolve => setTimeout(resolve, 1200))

        return { data: rows }
      },
    }
  : undefined
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="table-pivot-dom"
    :data-ready="ready"
  >
    <button
      data-example-control
      @click="table?.fitColumns(undefined, { mode: 'justify' })"
    >
      Justify
    </button>
    <button
      data-example-control
      @click="route.query.wrapper ? wrapperMounted = !wrapperMounted : mounted = !mounted"
    >
      Toggle tables
    </button>
    <div v-if="wrapperMounted">
      <template v-if="cellContracts">
        <button
          data-example-control
          @click="formatVersion++"
        >
          Replace cell format
        </button>
        <button
          data-example-control
          @click="valuesOnRows = !valuesOnRows"
        >
          Toggle value orientation
        </button>
        <button
          data-example-control
          @click="clickMode = (clickMode + 1) % 3"
        >
          Cycle cell interaction
        </button>
        <button
          data-example-control
          @click="cellRows = cellRows.map(row => row.id ? row : { ...row, value: 0 })"
        >
          Use zero aggregate
        </button>
        <output
          data-example-output
          data-testid="pivot-last-cell"
        >{{ lastCell }}</output>
      </template>
      <button
        v-if="route.query.updates"
        data-example-control
        @click="configVersion++"
      >
        Replace configurations
      </button>
      <output
        v-if="route.query.updates"
        data-example-output
        aria-label="Selection events"
        data-testid="select-all-calls"
      >{{ JSON.stringify(selectAllCalls) }}</output>
      <div data-testid="table">
        <Table
          v-if="mounted"
          ref="table"
          v-model:selection="selection"
          :columns
          :rows="tableRows"
          :totals
          :storage-key="null"
          :features
          :pagination-config="controls ? { enabled: true, pageSize: configVersion % 2 ? 25 : 10, options: [10, 25] } : undefined"
          :selection-config="route.query.updates
            ? { enabled: true, multi: true, emitKey: route.query.emitKey === 'true', onSelectAll: handleSelectAll }
            : undefined"
          :breakpoint="1"
          :split-rows="[]"
          :auto-fit="{ onInit: false }"
          :modifiers="{ useUrl: false, autoSaveSchema: false }"
          :ui="{ containerClass: ({ defaults }) => [defaults.all, 'w-600px h-300px'] }"
        />
      </div>
      <Pivot
        v-if="mounted"
        :performance="route.query.warning ? { sourceRowWarningThreshold: 1 } : undefined"
        :data="loadData ? undefined : cellContracts ? cellRows : rows"
        :load-data
        :items
        :config="cellContracts ? { valuesOnRows } : undefined"
        :row-clickable="!cellContracts || clickMode !== 2"
        :cell-clickable="!cellContracts || clickMode === 0"
        :ui="{
          containerStyle: () => ({ width: '600px', height: '300px' }),
          ...(route.query.updates
            ? { contentStyle: configVersion % 2
              ? () => ({ backgroundColor: 'rgb(210, 230, 250)' })
              : () => ({ backgroundColor: 'rgb(250, 230, 210)' }) }
            : {}),
        }"
        @click:row="pivotRowClicks++"
        @click:cell="handlePivotCellClick"
      >
        <template
          v-if="cellContracts"
          #top
        >
          <PivotValueCellProbe />
        </template>
      </Pivot>
      <output
        data-example-output
        data-testid="pivot-clicks"
      >{{ pivotRowClicks }}:{{ pivotCellClicks }}</output>
    </div>
  </section>
</template>
