<script setup lang="ts" vapor>
import { computed, getCurrentInstance, onMounted, ref } from 'vue'

const props = defineProps<{ count: number }>()
const emit = defineEmits<{ increment: [] }>()
const text = ref('Vapor')
const doubled = computed(() => props.count * 2)
// eslint-disable-next-line vapor/renderer-independent -- Deliberate runtime diagnostic for the renderer test.
const setupHasVDOMInstance = getCurrentInstance() !== null
const runtime = ref('pending')
onMounted(() => {
  runtime.value = setupHasVDOMInstance ? 'vdom' : 'vapor'
})
</script>

<template>
  <section
    data-testid="vapor-probe"
    :data-runtime="runtime"
  >
    <p data-testid="instance-check">
      Client runtime: {{ runtime }}
    </p>
    <p data-testid="vapor-count">
      Count: {{ count }}; doubled: {{ doubled }}
    </p>
    <button
      data-testid="increment"
      type="button"
      @click="emit('increment')"
    >
      Increment
    </button>
    <label>
      Text
      <input
        v-model="text"
        data-testid="vapor-input"
      >
    </label>
    <p data-testid="vapor-text">
      {{ text }}
    </p>
    <slot :count="count" />
    <Badge
      :counter="count"
      data-testid="vdom-badge"
    />
  </section>
</template>
