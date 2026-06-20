<script setup lang="ts">
import { faker } from '@faker-js/faker'

const CENTERS = ['Distribuce - frigo', 'Kamiony - cisterny', 'Pekárny', 'Provozní režie'] as const
const MONTHS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'] as const

const loadData: IPivotProps['loadData'] = {
  fnc: () => {
    const data = faker.helpers.multiple(
      () => {
        const center = faker.helpers.arrayElement(CENTERS)
        const month = faker.helpers.arrayElement(MONTHS)

        return {
          center,
          month,
          revenue: faker.number.float({ min: 1000, max: 500000, fractionDigits: 2 }),
          cost: faker.number.float({ min: 500, max: 400000, fractionDigits: 2 }),
          units: faker.number.int({ min: 10, max: 5000 }),
        }
      },
      { count: 48 },
    )

    return { data, count: data.length }
  },
}

const items = ref([
  new PivotItem({ field: 'center', label: 'Název střediska', dataType: 'string', width: '180px', usage: { row: { index: 0 } } }),
  new PivotItem({ field: 'month', dataType: 'string', usage: { column: { index: 0 } } }),
  new PivotItem({ field: 'revenue', label: 'Výnosy', dataType: 'number', width: '100px', usage: { value: [{ index: 0 }] } }),
  new PivotItem({ field: 'cost', label: 'Náklady', dataType: 'number', width: '100px', usage: { value: [{ index: 1 }] } }),
  new PivotItem({ field: 'units', label: 'Počet jednotek', dataType: 'number', width: '100px', usage: { value: [{ index: 2 }] } }),
])
</script>

<template>
  <div
    flex="~ col gap-4"
    overflow="auto"
    h="95vh"
  >
    <Pivot
      v-model:items="items"
      :load-data
      title="Sales Report"
      :config="{ useEmptyRow: true, valuesOnRows: true }"
    />
  </div>
</template>
