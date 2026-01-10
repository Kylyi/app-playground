<script setup lang="ts">
const dateUtc = $date('2025-01-01', { utc: true })
const dateLocal = $date('2025-01-01', { utc: false })
</script>

<template>
  <div>
    <h1>Home</h1>
    <p>UTC: {{ dateUtc }}</p>
    <p>Local: {{ dateLocal }}</p>
  </div>
</template>
