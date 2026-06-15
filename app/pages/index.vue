<script setup lang="ts">
import { faker } from '@faker-js/faker'
import { ComparatorEnum } from '$comparatorEnum'

const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America'] as const
const CATEGORIES = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'] as const

const loadData: IPivotProps['loadData'] = {
  fnc: () => {
    const data = faker.helpers.multiple(
      () => {
        const date = faker.date.between({ from: '2023-01-01', to: '2025-12-31' })

        return {
          region: faker.helpers.arrayElement(REGIONS),
          category: faker.helpers.arrayElement(CATEGORIES),
          product: faker.commerce.productName(),
          date,
          year: date.getFullYear(),
          quarter: `Q${Math.floor(date.getMonth() / 3) + 1}`,
          month: date.toLocaleString('en-US', { month: 'short' }),
          revenue: faker.number.float({ min: 50, max: 5000, fractionDigits: 2 }),
          units: faker.number.int({ min: 1, max: 50 }),
        }
      },
      { count: 25 },
    )

    return { data, count: data.length }
  },
}

const items = ref([
  new PivotItem({ field: 'region', dataType: 'string', width: '120px', usage: { row: { index: 0 } } }),
  new PivotItem({ field: 'category', dataType: 'string', width: '160px', usage: { row: { index: 1 } } }),
  new PivotItem({ field: 'product', dataType: 'string', width: '160px', usage: { row: { index: 2 } } }),
  new PivotItem({ field: 'year', dataType: 'number', usage: { column: { index: 0 } } }),
  new PivotItem({ field: 'quarter', usage: { column: { index: 1 } } }),
  new PivotItem({ field: 'revenue', dataType: 'number', width: '80px', usage: { value: [{ index: 0 }] } }),
  new PivotItem({ field: 'units', dataType: 'number', width: '80px', usage: { value: [{ index: 1 }] } }),
  new PivotItem({ field: 'date', dataType: 'date', usage: { filter: [] } }),
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
      :config="{ useEmptyRow: true }"
    />
  </div>
</template>
