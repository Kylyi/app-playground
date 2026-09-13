<script setup lang="ts" vapor>
const route = useRoute()
const small = route.query.small === 'true'
const rows = ref(Array.from({ length: small ? 6 : 100 }, (_, id) => ({ id, label: `Row ${id}` })))
const primary = useTemplateRef('primary')
const mounted = ref(true)
const expanded = ref(false)
const ready = ref(false)
const startIndex = ref(-1)
const visibleResult = ref(-1)
onMounted(() => ready.value = true)

function renderVisible() {
  visibleResult.value = primary.value?.renderOnlyVisible()?.firstRow?.idx ?? -1
}

function appendRows() {
  const count = rows.value.length
  rows.value = [...rows.value, ...Array.from({ length: 20 }, (_, idx) => ({ id: count + idx, label: `Row ${count + idx}` }))]
}
</script>

<template>
  <section
    data-testid="virtual-example"
    :data-ready="ready"
  >
    <VirtualScroller
      v-if="mounted"
      ref="primary"
      data-testid="primary-scroller"
      :rows
      :row-height="32"
      :threshold="10"
      :initial-rows-render-count="8"
      :overscan="{ top: 32, bottom: 96 }"
      fetch-more
      :ui="{ containerStyle: () => ({ height: '220px', width: '320px' }) }"
      @virtual-scroll="startIndex = $event.visibleStartItem.index"
    >
      <template #default="{ row }">
        <div :style="{ height: expanded && row.id % 10 === 0 ? '112px' : '32px' }">
          {{ row.label }}
        </div>
      </template>
      <template #inner-content>
        <span
          data-testid="inner-content"
          hidden
        >Inner content</span>
      </template>
    </VirtualScroller>
    <VirtualScroller
      data-testid="secondary-scroller"
      :rows
      :row-height="32"
      :threshold="10"
      :initial-rows-render-count="8"
      :overscan="{ top: 32, bottom: 96 }"
      :ui="{ containerStyle: () => ({ height: '180px', width: '320px' }) }"
    >
      <template #default="{ row }">
        <div :style="{ height: '32px' }">
          Second {{ row.label }}
        </div>
      </template>
    </VirtualScroller>
    <button
      data-example-control
      @click="expanded = !expanded"
    >
      Toggle heights
    </button>
    <button
      data-example-control
      @click="primary?.scrollTo(60)"
    >
      Scroll to row 60
    </button>
    <button
      data-example-control
      @click="primary?.scrollToBottom({ makeSure: true })"
    >
      Scroll to bottom
    </button>
    <button
      data-example-control
      @click="primary?.scrollToTop()"
    >
      Scroll to top
    </button>
    <button
      data-example-control
      @click="renderVisible"
    >
      Render viewport only
    </button>
    <button
      data-example-control
      @click="primary?.clear()"
    >
      Clear rendered rows
    </button>
    <button
      data-example-control
      @click="primary?.rerender()"
    >
      Rerender rows
    </button>
    <button
      data-example-control
      @click="appendRows"
    >
      Append rows
    </button>
    <button
      data-example-control
      @click="rows = []"
    >
      Clear data
    </button>
    <button
      data-example-control
      @click="mounted = !mounted"
    >
      Toggle virtual owner
    </button>
    <output
      data-example-output
      aria-label="Start index"
      data-testid="start-index"
    >{{ startIndex }}</output>
    <output
      data-example-output
      aria-label="Visible result"
      data-testid="visible-result"
    >{{ visibleResult }}</output>
  </section>
</template>
