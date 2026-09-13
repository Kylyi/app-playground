<script setup lang="ts" vapor>
const model = defineModel<number>({ default: 0 })
</script>

<template>
  <div>
    <button @click="model++">
      Increment {{ model }}
    </button>
    <slot :value="model">
      <output>{{ model }}</output>
    </slot>
  </div>
</template>
