<script setup lang="ts" vapor>
const model = defineModel<string>()
const input = useTemplateRef<HTMLInputElement>('input')
defineExpose({
  focus: () => input.value?.focus(),
  select: () => {
    input.value?.focus()
    input.value?.select()
  },
})
</script>

<template>
  <input
    ref="input"
    v-model="model"
    data-example-control
    aria-label="Vapor editor"
  >
</template>
