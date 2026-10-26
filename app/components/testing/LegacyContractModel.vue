<script setup lang="ts">
import { initRef } from '#layers/utilities/app/utils/init-ref'

const props = defineProps<{ modelValue?: string | null }>()
defineEmits<{ 'update:modelValue': [value: string | null | undefined] }>()
// This deliberate VDOM consumer verifies the still-used compatibility API.
const instance = getCurrentInstance()
const model = initRef({ instance, props, propName: 'modelValue', defaultValue: 'Local legacy value' })
</script>

<template>
  <input
    :value="model ?? ''"
    aria-label="Legacy value"
    @input="model = ($event.target as HTMLInputElement).value"
  >
</template>
