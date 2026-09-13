<script setup lang="ts" vapor>
const context = inject('tooltip-test-context', 'missing author context')
</script>

<template>
  <span>{{ context }}</span>
</template>
