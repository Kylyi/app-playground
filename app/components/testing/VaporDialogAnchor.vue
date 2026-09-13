<script setup lang="ts" vapor>
import { useDialogLayout } from '../../../packages/UI/app/components/Dialog/functions/useDialogLayout'

const props = defineProps<{
  target?: string
  manual?: boolean
  trigger?: 'click' | 'contextmenu'
  onToggle: () => void
}>()
const anchor = useTemplateRef<HTMLSpanElement>('anchor')
const value = ref(false)
const model = computed({
  get: () => value.value,
  set: next => {
    value.value = next
    props.onToggle()
  },
})
const ready = ref(false)
useDialogLayout(model, props, () => anchor.value?.parentElement)
onMounted(() => ready.value = true)
</script>

<template>
  <span
    ref="anchor"
    hidden
  />
  <output
    data-example-output
    aria-label="Native dialog model"
    data-testid="native-dialog-model"
    :data-ready="ready"
  >{{ model }}</output>
</template>
