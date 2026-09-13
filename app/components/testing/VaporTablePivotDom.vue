<script setup lang="ts" vapor>
import { ComparatorEnum } from '$comparatorEnum'
import { FilterItem } from '../../../packages/Utilities/app/models/filter-item.model'
import { TableColumn } from '../../../packages/UI/app/components/Table/models/table-column.model'
import { PivotItem } from '../../../packages/UI/app/components/Pivot/models/pivot-item.model'
import type { TableFeature } from '../../../packages/UI/app/components/Table/types/table-feature.type'
import type { ITableTotal } from '../../../packages/UI/app/components/Table/types/table-total.type'

const route = useRoute()
const controls = route.query.controls === 'true'
const empty = route.query.empty === 'true'
const controlFeature = typeof route.query.feature === 'string'
  ? route.query.feature as TableFeature
  : undefined
const table = useTemplateRef('table')
const mounted = ref(true)
const wrapperMounted = ref(true)
const ready = ref(false)
const pivotRowClicks = ref(0)
const pivotCellClicks = ref(0)
const rows = Array.from({ length: 100 }, (_, id) => ({ id, name: `Item ${id}`, group: `Group ${id % 8}`, value: id + 1 }))
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
const items = [
  new PivotItem({ field: 'name', usage: { row: { index: 0 } } }),
  new PivotItem({ field: 'group', usage: { column: { index: 0 } } }),
  new PivotItem({ field: 'value', dataType: 'number', usage: { value: [{ index: 0, summaryType: SummaryEnum.SUM }] } }),
]
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
      <div data-testid="table">
        <Table
          v-if="mounted"
          ref="table"
          :columns
          :rows="tableRows"
          :totals
          :storage-key="null"
          :features
          :pagination-config="controls ? { enabled: true, pageSize: 10, options: [10, 25] } : undefined"
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
        :data="loadData ? undefined : rows"
        :load-data
        :items
        row-clickable
        cell-clickable
        :ui="{ containerStyle: () => ({ width: '600px', height: '300px' }) }"
        @click:row="pivotRowClicks++"
        @click:cell="pivotCellClicks++"
      />
      <output
        data-example-output
        data-testid="pivot-clicks"
      >{{ pivotRowClicks }}:{{ pivotCellClicks }}</output>
    </div>
  </section>
</template>
