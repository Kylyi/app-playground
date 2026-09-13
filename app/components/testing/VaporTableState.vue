<script setup lang="ts" vapor>
import { useTableStore } from '../../../packages/UI/app/components/Table/stores/table.store'

const props = defineProps<{ label: string, storageKey?: string | null }>()
const { customData, storageKey } = useTableStore({
  storageKey: () => props.storageKey,
})
const ready = ref(false)
onMounted(() => ready.value = true)
</script>

<template>
  <section
    :data-testid="label"
    :data-ready="ready"
  >
    <output
      data-example-output
      aria-label="Identity"
      data-testid="identity"
    >{{ storageKey }}</output>
    <output
      data-example-output
      aria-label="Value"
      data-testid="value"
    >{{ ready ? customData.count ?? 0 : 'pending' }}</output>
    <button
      data-example-control
      @click="customData.count = (customData.count ?? 0) + 1"
    >
      Increment
    </button>
  </section>
</template>
