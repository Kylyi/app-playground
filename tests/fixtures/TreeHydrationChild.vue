<script setup lang="ts" vapor>
const label = 'Hydration child'
</script>

<template>
  <div>
    {{ label }}
    <slot name="inner" />
  </div>
</template>
