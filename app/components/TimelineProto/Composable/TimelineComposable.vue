<script setup lang="ts">
// Types
import type { ITimelineComposableProps, ITimelineComposableValue } from './types/timeline-composable-props.type'

// Functions
import { timelineComposableContextKey, useTimelineComposable } from './composables/useTimelineComposable'

const props = withDefaults(defineProps<ITimelineComposableProps>(), {
  modelValue: undefined,
  orientation: 'vertical',
  side: 'end',
  timePlacement: 'inline',
  size: 'md',
  marker: 'auto',
  color: 'primary',
  lineStyle: 'solid',
  lineWidth: 2,
  itemWidth: '12rem',
  skeletonCount: 3,
  pendingIcon: 'i-svg-spinners:ring-resize',
  expandIcon: 'i-lucide:chevron-down',
  scrollToActive: true,
})

const emits = defineEmits<{
  (e: 'select', payload: { value: ITimelineComposableValue, index: number }): void
}>()

defineSlots<{
  default?: () => any
}>()

// Layout
const model = defineModel<ITimelineComposableValue | null | undefined>({ default: undefined })
const containerEl = ref<HTMLElement>()
const listEl = ref<HTMLElement>()
const timeline = useTimelineComposable(props, model, listEl)

provide(timelineComposableContextKey, {
  values: timeline.values,
  indexByEl: timeline.indexByEl,
  count: timeline.count,
  hasProgress: timeline.hasProgress,
  activeIndex: timeline.activeIndex,
  classes: timeline.classes,
  model,
  props,
  select: value => {
    if (timeline.select(value)) {
      emits('select', { value: value!, index: timeline.activeIndex.value })
    }
  },
})

// Only the list's own children matter ~ content changes inside the items do not trigger anything
useMutationObserver(listEl, timeline.syncItems, { childList: true })
onMounted(timeline.syncItems)

// Horizontal ~ keep the active item in view
function scrollToItem(index = timeline.activeIndex.value) {
  const itemEl = timeline.itemEls.value[index] as HTMLElement | undefined

  if (!itemEl || !containerEl.value || props.orientation !== 'horizontal') {
    return
  }

  const { clientWidth } = containerEl.value
  containerEl.value.scrollTo({ left: itemEl.offsetLeft - (clientWidth - itemEl.offsetWidth) / 2 })
}

watch(timeline.activeIndex, index => {
  if (props.scrollToActive) {
    scrollToItem(index)
  }
}, { flush: 'post' })

// Styles
const containerStyle = computed(() => {
  return [
    {
      '--tlc-line-width': `${props.lineWidth}px`,
      '--tlc-item-width': props.itemWidth,
    },
    props.ui?.containerStyle?.(),
  ]
})

defineExpose({
  next: timeline.next,
  prev: timeline.prev,
  activeIndex: timeline.activeIndex,
  count: timeline.count,
  scrollToItem,
})
</script>

<template>
  <div
    ref="containerEl"
    :class="[`timeline-composable--${orientation}`, timeline.classes.value.containerClass]"
    :style="containerStyle"
  >
    <ol
      ref="listEl"
      :class="timeline.classes.value.listClass"
    >
      <template v-if="loading">
        <TimelineComposableItem
          v-for="idx in skeletonCount"
          :key="`skeleton-${idx}`"
          skeleton
        />
      </template>

      <slot v-else />

      <TimelineComposableItem
        v-if="pending && !loading"
        key="pending"
        status="pending"
        :title="typeof pending === 'string' ? pending : 'In progress…'"
      />
    </ol>
  </div>
</template>
