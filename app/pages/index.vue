<script setup lang="ts">
const date = $date('2026-01-01')
const test = $t('general.generalInfo')
</script>

<template>
  <div
    flex="~ col gap-4"
    overflow="auto"
    h="95vh"
  >
    <Table />
  </div>
</template>
