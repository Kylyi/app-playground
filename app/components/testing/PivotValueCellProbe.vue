<script setup lang="ts" vapor>
import { usePivotStore } from '#layers/ui/app/components/Pivot/stores/pivot.store'
import { resolvePivotDisplayedValueCells } from '#layers/ui/app/components/Pivot/functions/pivot-resolve-value-item'

const { visibleData, visibleValueColumns, valueLayout } = usePivotStore()
const row = computed(() => visibleData.value[0])
const column = computed(() => visibleValueColumns.value[0])
const cell = computed(() => row.value && resolvePivotDisplayedValueCells({
  row: row.value,
  columns: visibleValueColumns.value.slice(0, 1),
  layout: valueLayout.value,
})[0])
</script>

<template>
  <div data-testid="standalone-pivot-cell">
    <PivotValueItemCell
      v-if="cell && column && row"
      :item="cell"
      :column
      :row
    />
  </div>
</template>
