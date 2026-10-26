<script setup lang="ts" vapor>
import { Pivot, Selector, Table, Tree, VirtualScroller } from '#components'
import { TableColumn } from '#layers/ui/app/components/Table/models/table-column.model'
import { PivotItem } from '#layers/ui/app/components/Pivot/models/pivot-item.model'

const route = useRoute()
const family = typeof route.query.family === 'string' ? route.query.family : 'table'
const config = useRuntimeConfig()
const count = 2000
const visible = ref(true)
const ready = ref(false)
const revision = ref(0)
const seedRows = Array.from({ length: count }, (_, index) => ({
  id: `row-${index}`,
  label: `Record ${index}`,
  name: `Record ${index}`,
  group: `Group ${index % 20}`,
  value: index + 1,
}))
const rows = shallowRef(seedRows)
const columns = [
  new TableColumn({ field: 'name', label: 'Name', width: '240px' }),
  new TableColumn({ field: 'group', label: 'Group', width: '180px' }),
  new TableColumn({ field: 'value', label: 'Value', width: '160px', dataType: 'number' }),
]
const pivotItems = [
  new PivotItem({ field: 'name', usage: { row: { index: 0 } } }),
  new PivotItem({ field: 'group', usage: { column: { index: 0 } } }),
  new PivotItem({ field: 'value', dataType: 'number', usage: { value: [{ index: 0, summaryType: SummaryEnum.SUM }] } }),
]
const selection = ref('row-0')
const surface = useTemplateRef('surface')
const pivot = useTemplateRef('pivot')
// Diagnostic control: match the initial row estimate to this fixed viewport.
// The normal workload keeps the library's existing SSR estimate unchanged.
const requestedInitialRows = Number(route.query.initialRows)
const initialRowsRenderCount = Number.isInteger(requestedInitialRows) && requestedInitialRows > 0
  ? requestedInitialRows
  : undefined
const scrollerConfig = { threshold: 10, rowHeight: 32, overscan: { top: 64, bottom: 64 }, initialRowsRenderCount }

async function settle() {
  await nextTick()
  // Include the browser's layout work; a second frame delivers owned observers.
  surface.value?.getBoundingClientRect()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
}

async function measure(action: 'mount' | 'update' | 'remove', profile = false) {
  const start = performance.now()
  if (profile) {
    performance.mark(`benchmark:${action}:start`)
  }
  if (action === 'mount') {
    visible.value = true
  } else if (action === 'remove') {
    visible.value = false
  } else {
    revision.value++
    rows.value = seedRows.map(row => ({ ...row, label: `${row.label} update ${revision.value}`, name: `${row.name} update ${revision.value}` }))
  }
  await nextTick()
  const commit = performance.now() - start
  if (profile) {
    performance.mark(`benchmark:${action}:commit`)
  }
  surface.value?.getBoundingClientRect()
  const flush = performance.now() - start
  if (profile) {
    performance.mark(`benchmark:${action}:flush`)
  }
  // Async workers must publish the requested rows before the operation is
  // complete. Observe public DOM output rather than internal renderer state.
  const expected = revision.value ? `Record 0 update ${revision.value}` : 'Record 0'
  while (action === 'remove'
    ? surface.value?.textContent?.trim()
    : !surface.value?.textContent?.includes(expected)) {
    if (performance.now() - start > 10000) {
      throw new Error(`${family} ${action} did not publish its expected content`)
    }
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
  surface.value?.getBoundingClientRect()
  const contentReady = performance.now() - start
  if (profile) {
    performance.mark(`benchmark:${action}:contentReady`)
  }
  await settle()

  return { commit, layout: flush - commit, flush, contentReady, settled: performance.now() - start }
}

onMounted(async () => {
  await settle()
  ready.value = true
  Object.assign(window, {
    gentlBenchmark: {
      measure,
      family,
      count,
      snapshot: () => {
        const store = pivot.value?.store()

        return store
          ? {
              source: store.sourceData.value.length,
              data: store.data.value.length,
              visible: store.visibleData.value.length,
              transforming: store.isTransforming.value,
              error: String(store.transformError.value),
            }
          : undefined
      },
    },
  })
})
</script>

<template>
  <main
    :data-renderer="config.public.benchmarkRenderer"
    :data-parent="config.public.benchmarkParent"
    :data-ready="ready"
    :data-family="family"
  >
    <h1>{{ family }} · {{ count }} records</h1>
    <output data-testid="benchmark-revision">{{ revision }}</output>
    <div
      ref="surface"
      data-testid="benchmark-surface"
      class="benchmark-surface"
    >
      <template v-if="visible">
        <Table
          v-if="family === 'table'"
          :rows
          :columns
          :features="[]"
          :storage-key="null"
          :breakpoint="1"
          :split-rows="[]"
          :auto-fit="{ onInit: false }"
          :modifiers="{ useUrl: false, autoSaveSchema: false }"
          :scroller-config="scrollerConfig"
          :ui="{ containerClass: ({ defaults }) => [defaults.all, 'benchmark-table'] }"
        />
        <Tree
          v-else-if="family === 'tree'"
          :model-value="rows"
          :search-config="{ enabled: false }"
          :sorting-config="{ enabled: false }"
          :selection-config="{ enabled: false }"
          :scroller-config="scrollerConfig"
          :ui="{ contentStyle: () => ({ height: '320px' }) }"
        />
        <Pivot
          v-else-if="family === 'pivot'"
          ref="pivot"
          :data="rows"
          :items="pivotItems"
          :ui="{ containerStyle: () => ({ width: '640px', height: '320px' }) }"
        />
        <Selector
          v-else-if="family === 'selector'"
          v-model="selection"
          :options="rows"
          :clearable="false"
          layout="regular"
          label="Benchmark selector"
        />
        <VirtualScroller
          v-else
          :rows
          row-key="id"
          :row-height="32"
          :initial-rows-render-count
          :threshold="10"
          :overscan="{ top: 64, bottom: 64 }"
          :ui="{ containerStyle: () => ({ height: '320px', width: '640px' }) }"
        >
          <template #default="{ row }">
            <div class="benchmark-row">
              {{ row.label }}
            </div>
          </template>
        </VirtualScroller>
      </template>
    </div>
  </main>
</template>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
}
main {
  padding: 24px;
}
.benchmark-surface {
  width: 640px;
  height: 360px;
}
.benchmark-table {
  width: 640px;
  height: 320px;
}
.benchmark-row {
  height: 32px;
}
</style>
