<script setup lang="ts" vapor>
const route = useRoute()
const slow = route.query.mode === 'slow'
const opened = ref(!slow)
const visible = ref(true)
const contentHeight = ref(60)
const maximum = ref(320)
const calculate = ref(true)
const ready = ref(false)
const changes = ref(0)
let finishOpening: ((value: void | false) => void) | undefined
const pending = ref(false)

function beforeShow() {
  if (!slow) {
    return undefined
  }
  pending.value = true

  return new Promise<void | false>(resolve => finishOpening = resolve)
}

function resolveOpening() {
  finishOpening?.(undefined)
  pending.value = false
}

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="collapse-contracts"
    :data-ready="ready"
    flex="~ col gap-3"
  >
    <div flex="~ gap-2 wrap">
      <button
        data-example-control
        @click="contentHeight = 180"
      >
        Grow collapse content
      </button>
      <button
        data-example-control
        @click="contentHeight = 40"
      >
        Shrink collapse content
      </button>
      <button
        data-example-control
        @click="maximum = 80"
      >
        Cap collapse height
      </button>
      <button
        data-example-control
        @click="maximum = 0"
      >
        Zero collapse height
      </button>
      <button
        data-example-control
        @click="calculate = !calculate"
      >
        Toggle height calculation
      </button>
      <button
        data-example-control
        @click="visible = !visible"
      >
        Toggle collapse owner
      </button>
      <button
        data-example-control
        @click="resolveOpening"
      >
        Resolve delayed collapse opening
      </button>
    </div>
    <Collapse
      v-if="visible"
      v-model="opened"
      title="Consumer collapse"
      auto-adjust-height
      :max-content-height="maximum"
      :no-height-calculation="!calculate"
      :before-show-fnc="beforeShow"
      :ui="{ contentInnerStyle: () => ({ padding: '0px' }) }"
      data-testid="consumer-collapse"
      @update:model-value="changes++"
    >
      <div
        :style="{ height: `${contentHeight}px` }"
        data-testid="collapse-sized-content"
      >
        Native collapse content
      </div>
    </Collapse>
    <output
      data-example-output
      data-testid="collapse-opened"
    >{{ String(opened) }}</output>
    <output
      data-example-output
      data-testid="collapse-changes"
    >{{ changes }}</output>
    <output
      data-example-output
      data-testid="collapse-pending"
    >{{ String(pending) }}</output>
  </section>
</template>
