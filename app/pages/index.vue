<script setup lang="ts">
import { faker } from '@faker-js/faker'

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
      { count: 300 },
    )

    return { data, count: data.length }
  },
}

const rows = ref([
  new PivotRow({ field: 'region', dataType: 'string', width: '120px' }),
  new PivotRow({ field: 'category', dataType: 'string', width: '160px' }),
  new PivotRow({ field: 'product', dataType: 'string', width: '160px' }),
])

const columns = ref([
  new PivotColumn({ field: 'year' }),
  new PivotColumn({ field: 'quarter' }),
])

const values = ref([
  new PivotValue({ field: 'revenue' }),
  new PivotValue({ field: 'units' }),
])
</script>

<template>
  <div
    flex="~ col gap-4"
    overflow="auto"
    h="95vh"
  >
    <Pivot
      :load-data
      :rows
      :columns
      :values
      :config="{ useEmptyRow: true }"
    />
  </div>
</template>
