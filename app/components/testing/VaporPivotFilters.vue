<script setup lang="ts" vapor>
import { PivotItem } from '#layers/ui/app/components/Pivot/models/pivot-item.model'

const ready = ref(false)
const visible = ref(true)
const data = [{ team: 'Alpha', amount: 10 }, { team: 'Beta', amount: 20 }, { team: 'Gamma', amount: 30 }]
const items = [
  new PivotItem({ field: 'team', label: 'Team', dataType: 'string', usage: { row: { index: 0 } } }),
  new PivotItem({ field: 'amount', label: 'Amount', dataType: 'number', usage: { value: [{ index: 0, summaryType: SummaryEnum.SUM }] } }),
]
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="pivot-filters-example"
    :data-ready="ready"
    flex="~ col gap-4"
  >
    <button
      data-example-control
      type="button"
      @click="visible = !visible"
    >
      Toggle owner
    </button>
    <Pivot
      v-if="visible"
      :data
      :items
      :ui="{ containerStyle: () => ({ height: '360px' }) }"
      data-testid="filters-pivot"
    />
  </section>
</template>
