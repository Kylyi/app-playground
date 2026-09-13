<script setup lang="ts" vapor>
import { isNil } from 'lodash-es'
import { useInputMask } from '../../../packages/UI/app/components/Inputs/functions/useInputMask'

const props = defineProps<{ radix: string, inputVisible: boolean, onAccepted: () => void }>()
const model = defineModel<number | null>({ default: 12.5 })
const maskOptions = computed(() => ({ mask: Number, radix: props.radix, scale: 2, padFractionalZeros: true }))
const { el, mask, masked, typed, setTypedValue } = useInputMask(maskOptions, {
  initialValue: model.value,
  isEmptyValue: isNil,
  getReformatValue: () => model.value,
  onAccept: () => {
    props.onAccepted()
    model.value = masked.value === '' ? null : typed.value
  },
})
watch(model, setTypedValue)
</script>

<template>
  <div
    :data-live="!!mask"
    data-testid="mask-owner"
  >
    <input
      v-if="inputVisible"
      ref="el"
      data-example-control
      :value="masked"
      aria-label="Masked number"
    >
  </div>
</template>
