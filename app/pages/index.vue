<script setup lang="ts">
const date = $date('2026-01-01')
</script>

<template>
  <div
    flex="~ col gap-4"
    overflow="auto"
    h="95vh"
  >
    <DateInput v-model="date" />
    {{ formatValue(date, undefined, { dataType: 'date' }) }}
  </div>
</template>
