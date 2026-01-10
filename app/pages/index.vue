<script setup lang="ts">
import { utilsConfig } from '$utilsConfig'

const dateUtc = $date('2025-01-01', { utc: true })
const dateLocal = $date('2025-01-01', { utc: false })
const domain = utilsConfig.general.domain
</script>

<template>
  <div>
    <h1>Home</h1>
    <p>UTC: {{ dateUtc }}</p>
    <p>Local: {{ dateLocal }}</p>
    <p>Domain: {{ domain }}</p>
  </div>
</template>
