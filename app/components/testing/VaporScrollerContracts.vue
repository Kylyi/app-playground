<script setup lang="ts" vapor>
import type { ComponentExposed } from 'vue-component-type-helpers'
import type Vertical from '#layers/ui/app/components/VirtualScroller/VirtualScrollerVertical.vue'
import type MainScroller from '#layers/ui/app/components/VirtualScroller/VirtualScroller.vue'
import type { IVirtualScrollEvent } from '#layers/ui/app/components/VirtualScroller/types/virtual-scroll-event.type'
import type { ITreeScrollerConfig } from '#layers/ui/app/components/Tree/types/tree-props.type'

type Row = { id: number, label: string }
type Node = { key: number, title: string }
const sticky = useRoute().query.mode === 'sticky'
const rows = ref<Row[]>(Array.from({ length: 100 }, (_, id) => ({ id, label: `Contract row ${id}` })))
const primary = useTemplateRef<ComponentExposed<typeof Vertical<Row>>>('primary')
const main = useTemplateRef<ComponentExposed<typeof MainScroller<Row>>>('main')
const mounted = ref(true)
const ready = ref(false)
const rowHeight = ref(36)
const muted = ref(false)
const eventCount = ref(0)
const lastEvent = ref<IVirtualScrollEvent>()
const rendered = ref('')
const dimensions = ref(0)
const measuredOffset = ref(-1)
const expanded = ref(false)
const treeOverscan = ref(0)
const treeNodes = ref<Node[]>(Array.from({ length: 80 }, (_, key) => ({ key, title: `Typed node ${key}` })))
const treeConfig = computed<ITreeScrollerConfig<Node>>(() => ({
  rowHeight: 36,
  threshold: 0,
  overscan: { top: treeOverscan.value, bottom: treeOverscan.value },
  initialRowsRenderCount: 4,
  ui: { containerStyle: () => ({ height: '180px', width: '320px' }) },
}))

function recordScroll(event: IVirtualScrollEvent) {
  eventCount.value++
  lastEvent.value = event
}

function renderVisible(explicit = false) {
  const result = primary.value?.renderOnlyVisible(false, explicit ? { firstIdx: 2, lastIdx: 4 } : {})
  rendered.value = JSON.stringify({ first: result?.firstRow?.idx ?? null, last: result?.lastRow?.idx ?? null, ids: result?.rows.map(row => row.id) ?? [] })
}

function appendRows() {
  const start = rows.value.length
  rows.value = [...rows.value, ...Array.from({ length: 20 }, (_, index) => ({ id: start + index, label: `Contract row ${start + index}` }))]
}

async function measureNow() {
  const element = primary.value?.element?.querySelector<HTMLDivElement>('[data-index="0"]')
  if (!element) {
    return
  }
  // Read the result within this job, before ResizeObserver can measure for us.
  expanded.value = true
  await nextTick()
  primary.value?.updateRowHeight(element)
  await nextTick()
  const next = primary.value?.element?.querySelector<HTMLElement>('[data-index="1"]')
  measuredOffset.value = Number(next?.style.getPropertyValue('--translateY'))
}

function clearTall() {
  rowHeight.value = 72
  expanded.value = false
  primary.value?.clear({ rowHeight: 72 })
}

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="scroller-contracts"
    :data-ready="ready"
    flex="~ col gap-4"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        @click="primary?.scrollTo(60)"
      >
        Contract scroll 60
      </button>
      <button
        data-example-control
        @click="primary?.scrollToBottom()"
      >
        Contract bottom
      </button>
      <button
        data-example-control
        @click="primary?.scrollToTop()"
      >
        Contract top
      </button>
      <button
        data-example-control
        @click="primary?.clear()"
      >
        Contract clear
      </button>
      <button
        data-example-control
        @click="clearTall"
      >
        Contract clear tall
      </button>
      <button
        data-example-control
        @click="primary?.rerender()"
      >
        Contract rerender
      </button>
      <button
        data-example-control
        @click="primary?.rerender(true, false)"
      >
        Contract silent rerender
      </button>
      <button
        data-example-control
        @click="primary?.triggerScrollEvent()"
      >
        Contract emit
      </button>
      <button
        data-example-control
        @click="muted = !muted"
      >
        Contract mute
      </button>
      <button
        data-example-control
        @click="renderVisible()"
      >
        Contract viewport
      </button>
      <button
        data-example-control
        @click="renderVisible(true)"
      >
        Contract explicit range
      </button>
      <button
        data-example-control
        @click="measureNow"
      >
        Contract measure now
      </button>
      <button
        data-example-control
        @click="dimensions = primary?.getDimensions().virtualScroll?.height ?? 0"
      >
        Contract dimensions
      </button>
      <button
        data-example-control
        @click="appendRows"
      >
        Contract append
      </button>
      <button
        data-example-control
        @click="rows = []"
      >
        Contract empty
      </button>
      <button
        data-example-control
        @click="mounted = !mounted"
      >
        Contract toggle owner
      </button>
      <button
        data-example-control
        @click="main?.clear()"
      >
        Main clear sticky
      </button>
      <button
        data-example-control
        @click="main?.rerender()"
      >
        Main rerender sticky
      </button>
      <button
        data-example-control
        @click="treeOverscan = treeOverscan ? 0 : 360"
      >
        Tree change overscan
      </button>
    </div>
    <VirtualScrollerVertical
      v-if="mounted"
      ref="primary"
      data-testid="vertical-contract"
      :rows
      :row-height
      :initial-rows-render-count="4"
      :no-scroll-emit="muted"
      :virtualizer-options="{ overscan: 2 }"
      :sticky-indices="sticky ? [0, 20, 40, 60, 80] : []"
      fetch-more
      @virtual-scroll="recordScroll"
    >
      <template #default="{ row }">
        <div :style="{ height: `${expanded && row.id === 0 ? 108 : rowHeight}px` }">
          {{ row.label }}
        </div>
      </template>
      <template #inner-content>
        <span
          hidden
          data-testid="contract-inner-content"
        >Inner content retained</span>
      </template>
      <template #inner>
        <span
          hidden
          data-testid="contract-inner"
        >Inner retained</span>
      </template>
    </VirtualScrollerVertical>
    <output
      data-example-output
      data-testid="contract-events"
      aria-label="Scroll event count"
    >{{ eventCount }}</output>
    <output
      data-example-output
      data-testid="contract-last-event"
      aria-label="Last scroll event"
    >{{ JSON.stringify(lastEvent) }}</output>
    <output
      data-example-output
      data-testid="contract-rendered"
      aria-label="Rendered range"
    >{{ rendered }}</output>
    <output
      data-example-output
      data-testid="contract-measured"
      aria-label="Synchronous measurement"
    >{{ measuredOffset }}</output>
    <output
      data-example-output
      data-testid="contract-dimensions"
      aria-label="Scroller height"
    >{{ dimensions }}</output>
    <VirtualScroller
      ref="main"
      data-testid="main-sticky-contract"
      :rows
      :row-height="36"
      :threshold="0"
      :sticky-indices="[0, 20, 40, 60, 80]"
      :ui="{ containerStyle: () => ({ height: '180px', width: '320px' }) }"
    >
      <template #default="{ row }">
        <div :style="{ height: '36px' }">
          Main {{ row.label }}
        </div>
      </template>
    </VirtualScroller>
    <Tree
      v-model="treeNodes"
      data-testid="typed-tree"
      id-key="key"
      label-key="title"
      :scroller-config="treeConfig"
      :search-config="{ enabled: false }"
      :actions-config="{ enabled: false }"
      :sorting-config="{ enabled: false }"
      :collapse-config="{ hasChildrenFnc: () => false }"
    />
  </section>
</template>

<style lang="scss" scoped>
[data-testid='vertical-contract'] {
  height: 180px;
  width: 320px;
}
</style>
