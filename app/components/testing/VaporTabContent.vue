<script setup lang="ts" vapor>
const props = defineProps<{ name: string }>()
const message = inject<Ref<string>>('tabs-message')
const count = ref(0)
const record = inject<(name: string, event: string) => void>('tabs-lifecycle')
onMounted(() => record?.(props.name, 'mounted'))
onActivated(() => record?.(props.name, 'activated'))
onDeactivated(() => record?.(props.name, 'deactivated'))
onUnmounted(() => record?.(props.name, 'unmounted'))
</script>

<template>
  <div
    :data-testid="`panel-${name}`"
    flex="~ col gap-2"
  >
    <p>{{ message }}</p>
    <button
      data-example-control
      type="button"
      @click="count++"
    >
      Count {{ name }}: {{ count }}
    </button>
  </div>
</template>
