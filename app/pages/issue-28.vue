<script setup lang="ts">
import { TableColumn } from '../../packages/UI/app/components/Table/models/table-column.model'

const monoCells = ref(true)
const changedFont = ref(false)
const legacyWidths = ref(false)
const showMarkers = ref(true)
const promoteRows = ref(true)
const narrowTable = ref(false)
const manyRows = ref(false)
const generation = ref(0)
const root = ref<HTMLElement>()
const measurements = ref('')
const guideMeasurement = ref('')

function measureGuide() {
  requestAnimationFrame(() => {
    const guide = root.value?.querySelector('.splitter--active')?.getBoundingClientRect()
    const body = root.value?.querySelector('.virtual-scroll')?.getBoundingClientRect()
    if (guide && body) {
      guideMeasurement.value = `Last drag guide: ${guide.height.toFixed(2)}px tall · bottom offset from table viewport ${Math.abs(guide.bottom - body.bottom).toFixed(2)}px`
    }
  })
}
const columns = computed(() => ['name', 'team', 'role'].map(field => new TableColumn({
  field,
  label: field.toUpperCase(),
  ...(legacyWidths.value ? { width: '40ch' } : {}),
})))
const sampleRows = [
  { id: 1, name: 'Ada Lovelace', team: 'Engineering', role: 'Developer' },
  { id: 2, name: 'Grace Hopper', team: 'Research', role: 'Scientist' },
  { id: 3, name: 'Alan Turing', team: 'Research', role: 'Mathematician' },
]
const rows = computed(() => manyRows.value
  ? Array.from({ length: 60 }, (_, id) => ({ ...sampleRows[id % sampleRows.length], id }))
  : sampleRows)

async function measure() {
  await nextTick()
  requestAnimationFrame(() => {
    const header = root.value?.querySelector('.th')
    const cell = root.value?.querySelector('.td')
    const splitter = root.value?.querySelector<HTMLElement>('.splitter')
    if (!header || !cell) {
      return
    }
    const h = header.getBoundingClientRect().width
    const b = cell.getBoundingClientRect().width
    const handle = splitter ? Number.parseFloat(splitter.style.left) + 4 : NaN
    measurements.value = `First column: header ${h.toFixed(2)}px · body ${b.toFixed(2)}px · drift ${Math.abs(h - b).toFixed(2)}px · resize handle ${handle.toFixed(2)}px`
  })
}

function reset() {
  changedFont.value = false
  generation.value++
}
watch([monoCells, changedFont, legacyWidths, generation], measure, { flush: 'post' })
onMounted(measure)
</script>

<template>
  <main
    ref="root"
    class="issue-28"
    :class="{ 'changed-font': changedFont, 'show-markers': showMarkers, 'no-promotion': !promoteRows }"
    @pointerdown.capture="measureGuide"
    @pointermove="measureGuide"
  >
    <h1>Issue #28 — column width verification</h1>
    <p>Red header edges should align with blue body edges, including with monospace body cells. Columns now default to 320px; legacy ch widths fall back to 320px.</p>
    <div class="controls">
      <label><input
        v-model="monoCells"
        data-example-control
        type="checkbox"
      > Monospace body cells</label>
      <label><input
        v-model="legacyWidths"
        data-example-control
        type="checkbox"
        @change="reset"
      > Supply legacy 40ch widths</label>
      <label><input
        v-model="showMarkers"
        data-example-control
        type="checkbox"
      > Colored debug markers</label>
      <label><input
        v-model="promoteRows"
        data-example-control
        type="checkbox"
      > Row will-change: transform</label>
      <label><input
        v-model="narrowTable"
        data-example-control
        type="checkbox"
      > Narrow table (horizontal overflow)</label>
      <label><input
        v-model="manyRows"
        data-example-control
        type="checkbox"
      > Many rows (vertical overflow)</label>
      <button
        data-example-control
        @click="changedFont = !changedFont"
      >
        Toggle header font after mount
      </button>
      <button
        data-example-control
        @click="reset"
      >
        Reset table
      </button>
      <button
        data-example-control
        @click="measure"
      >
        Measure
      </button>
    </div>
    <p aria-live="polite">
      {{ measurements }}
    </p>
    <Table
      :key="`${legacyWidths}-${generation}`"
      storage-key="issue-28"
      :columns="columns"
      :rows="rows"
      :features="[]"
      :breakpoint="1"
      :split-rows="[]"
      :auto-fit="{ onInit: false }"
      :modifiers="{ useUrl: false, autoSaveSchema: false }"
      :ui="{ cellClass: ({ defaults }) => [defaults.all, monoCells ? 'font-mono' : ''] }"
      separator="cell"
      style="height: 300px"
      :style="{ maxWidth: narrowTable ? '640px' : undefined }"
      @column-resize="measure"
    />
    <p>Toggle the header font after mount: column widths and orange resize handles should remain aligned. Both default and legacy 40ch inputs should measure 320px with zero drift.</p>
    <p v-if="guideMeasurement">
      {{ guideMeasurement }}
    </p>
  </main>
</template>

<style scoped>
.issue-28 {
  padding: 24px;
  max-width: 100%;
}
h1 {
  font-size: 24px;
  font-weight: 700;
}
p {
  margin: 12px 0;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin: 20px 0;
}
label {
  display: flex;
  align-items: center;
  gap: 6px;
}
button {
  border: 1px solid #888;
  border-radius: 6px;
  padding: 6px 10px;
}
.show-markers :deep(.th) {
  box-shadow: inset -2px 0 #ef4444;
}
.show-markers :deep(.td) {
  box-shadow: inset -2px 0 #3b82f6;
}
.show-markers :deep(.splitter) {
  background: #f59e0b66;
}
.no-promotion :deep(.virtual-scroll__row) {
  will-change: auto;
}
.changed-font :deep(.th) {
  font-family: monospace;
}
</style>
