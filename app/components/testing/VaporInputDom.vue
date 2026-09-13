<script setup lang="ts" vapor>
import { useInputUtils } from '../../../packages/UI/app/components/Inputs/functions/useInputUtils'

const props = defineProps<{ id: string, modelValue?: string, multiline?: boolean }>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: string | undefined): void
  (event: 'focus'): void
  (event: 'blur', value: FocusEvent): void
  (event: 'clear'): void
}>()
const { el, masked, focus, select, blur, clear, handleBlur, handleFocusOrClick } = useInputUtils({
  props,
  emit,
  maskRef: ref({ mask: /.*/ }),
})
const ready = ref(false)
onMounted(() => ready.value = true)
</script>

<template>
  <section
    :data-testid="id"
    :data-ready="ready"
  >
    <textarea
      v-if="multiline"
      :id="id"
      ref="el"
      data-example-control
      :value="masked"
      @focus="handleFocusOrClick"
      @blur="handleBlur"
    />
    <input
      v-else
      :id="id"
      ref="el"
      data-example-control
      :value="masked"
      @focus="handleFocusOrClick"
      @blur="handleBlur"
    >
    <button
      data-example-control
      @click="focus()"
    >
      Focus
    </button>
    <button
      data-example-control
      @click="select()"
    >
      Select
    </button>
    <button
      data-example-control
      @click="blur()"
    >
      Blur
    </button>
    <button
      data-example-control
      @click="clear()"
    >
      Clear
    </button>
  </section>
</template>
