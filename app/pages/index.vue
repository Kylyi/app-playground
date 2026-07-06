<script setup lang="ts">
const date = $date('2026-01-01')
const test = $t('general.generalInfo')

const rC = useRuntimeConfig()
</script>

<template>
  <div
    flex="~ col gap-4"
    overflow="auto"
    h="95vh"
  >
    {{ typeof rC.public.useUtc }}: {{ rC.public.useUtc }}
  </div>
</template>
