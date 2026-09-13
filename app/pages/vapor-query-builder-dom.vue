<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <VaporQueryBuilderDom :key="route.query.small === 'true' ? 'small' : 'hierarchy'" />
</template>
