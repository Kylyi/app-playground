<script setup lang="ts" vapor>
const props = defineProps<{
  onReport: () => void
}>()
const mounted = ref(true)
const wide = ref(false)
const threshold = ref(0)
const first = useTemplateRef<HTMLDivElement>('first')
const second = useTemplateRef<HTMLDivElement>('second')
const results = reactive({ first: '', second: '', diff: '' })
const calls = reactive({ first: 0, second: 0 })
const ready = ref(false)

const { onOverflow } = useOverflow()

const refreshFirst = onOverflow(first, value => {
  results.first = String(value)
  calls.first++
  props.onReport()
}, { direction: 'horizontal', threshold })

const refreshSecond = onOverflow(() => second.value, value => {
  results.second = String(value)
  calls.second++
}, { direction: 'horizontal' })

const refreshDiff = onOverflow(first, value => {
  results.diff = JSON.stringify(value)
}, { direction: 'horizontal', returnDiff: true })

async function refresh() {
  await Promise.all([refreshFirst(), refreshSecond(), refreshDiff()])
}

defineExpose({ refresh })

function removeAndRefresh() {
  mounted.value = false

  return refresh()
}

onMounted(() => {
  ready.value = true
})
</script>

<template>
  <section
    data-testid="overflow"
    :data-ready="ready"
  >
    <div
      v-if="mounted"
      ref="first"
      class="overflow-box"
      :style="{ width: wide ? '240px' : '100px' }"
    >
      <div class="overflow-content">
        First
      </div>
    </div>

    <div
      ref="second"
      class="overflow-box"
    >
      <div class="overflow-content">
        Second
      </div>
    </div>

    <output
      data-example-output
      aria-label="First result"
      data-testid="first-result"
    >{{ results.first }}</output>
    <output
      data-example-output
      aria-label="Second result"
      data-testid="second-result"
    >{{ results.second }}</output>
    <output
      data-example-output
      aria-label="Difference"
      data-testid="difference"
    >{{ results.diff }}</output>
    <output
      data-example-output
      aria-label="First calls"
      data-testid="first-calls"
    >{{ calls.first }}</output>
    <output
      data-example-output
      aria-label="Second calls"
      data-testid="second-calls"
    >{{ calls.second }}</output>

    <button
      data-example-control
      @click="wide = !wide"
    >
      Resize first
    </button>

    <button
      data-example-control
      @click="threshold = 150; refresh()"
    >
      Raise threshold
    </button>

    <button
      data-example-control
      @click="refresh"
    >
      Refresh
    </button>

    <button
      data-example-control
      @click="removeAndRefresh"
    >
      Remove and refresh
    </button>

    <button
      data-example-control
      @click="mounted = true"
    >
      Restore first
    </button>
  </section>
</template>

<style scoped>
.overflow-box {
  width: 100px;
  height: 40px;
  overflow: hidden;
}

.overflow-content {
  width: 200px;
  height: 20px;
}
</style>
