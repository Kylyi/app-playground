<script setup lang="ts">
// Types
import type { ITimelineComposableItemProps } from './types/timeline-composable-item-props.type'
import type { ITimelineComposableStatus } from './types/timeline-composable-props.type'

// Functions
import { timelineComposableContextKey } from './composables/useTimelineComposable'

// Constants
import { TIMELINE_COMPOSABLE_COLORS } from './constants/timeline-composable-default-props.constant'

export type ITimelineComposableItemSlotProps = {
  status: ITimelineComposableStatus
  index: number
  isActive: boolean
  isFirst: boolean
  isLast: boolean
  side: 'start' | 'end'
  expanded: boolean
  toggle: () => void
}

defineOptions({ name: 'TimelineComposableItem' })

// `undefined` keeps the boolean override props falling back to the timeline's value
const props = withDefaults(defineProps<ITimelineComposableItemProps>(), {
  collapsible: undefined,
})

const slots = defineSlots<{
  default?: (props: ITimelineComposableItemSlotProps) => any
  marker?: (props: ITimelineComposableItemSlotProps) => any
  title?: (props: ITimelineComposableItemSlotProps) => any
  description?: (props: ITimelineComposableItemSlotProps) => any
  opposite?: (props: ITimelineComposableItemSlotProps) => any
}>()

const STATUS_LABELS: Partial<Record<ITimelineComposableStatus, string>> = {
  completed: 'Completed',
  active: 'Current',
  upcoming: 'Upcoming',
  error: 'Error',
  pending: 'In progress',
}

// Layout
const timeline = inject(timelineComposableContextKey)!
const itemEl = ref<HTMLElement>()
const bodyId = useId()
const expanded = defineModel<boolean>('expanded', { default: false })

// Publish the value for the timeline's progress, keyed by the element (the order is read from the DOM)
watch([itemEl, () => props.value], ([el], [oldEl]) => {
  if (oldEl && oldEl !== el) {
    timeline.values.delete(oldEl)
  }

  if (el) {
    timeline.values.set(el, props.value)
  }
}, { immediate: true })

onBeforeUnmount(() => {
  if (itemEl.value) {
    timeline.values.delete(itemEl.value)
  }
})

const index = computed(() => (itemEl.value && timeline.indexByEl.value.get(itemEl.value)) ?? -1)
const isFirst = computed(() => index.value === 0)
const isLast = computed(() => index.value === timeline.count.value - 1)
const isHorizontal = computed(() => timeline.props.orientation === 'horizontal')

const isActive = computed(() => {
  if (props.status) {
    return props.status === 'active'
  }

  return props.value !== undefined && timeline.model.value === props.value
})

const status = computed<ITimelineComposableStatus>(() => {
  if (props.status) {
    return props.status
  }

  if (!timeline.hasProgress.value) {
    return 'default'
  }

  if (isActive.value) {
    return 'active'
  }

  const activeIndex = timeline.activeIndex.value

  return activeIndex !== -1 && index.value < activeIndex ? 'completed' : 'upcoming'
})

const side = computed(() => {
  if (props.side) {
    return props.side
  }

  if (timeline.props.side === 'alternate') {
    return Math.max(index.value, 0) % 2 === 0 ? 'end' : 'start'
  }

  return timeline.props.side ?? 'end'
})

const isDisabled = computed(() => !!(props.disabled || timeline.props.disabled))
const isClickable = computed(() => !!timeline.props.clickable && props.value !== undefined && !isDisabled.value)
const isCollapsible = computed(() => props.collapsible ?? !!timeline.props.collapsible)
const isInteractive = computed(() => isClickable.value || (isCollapsible.value && !!slots.default))
const lineStyle = computed(() => props.lineStyle ?? timeline.props.lineStyle ?? 'solid')
const hasInlineTime = computed(() => !!props.time && timeline.props.timePlacement !== 'opposite')
const hasOpposite = computed(() => !!slots.opposite || (!!props.time && timeline.props.timePlacement === 'opposite'))
const hasHeader = computed(() => !!(props.title || slots.title || hasInlineTime.value))

// Marker ~ status icon > own icon > number > dot
const markerVariant = computed(() => props.marker ?? timeline.props.marker ?? 'auto')

const markerIcon = computed(() => {
  const statusIcons: Partial<Record<ITimelineComposableStatus, string | undefined>> = {
    completed: timeline.props.completedIcon,
    error: timeline.props.errorIcon,
    pending: timeline.props.pendingIcon,
  }

  const statusIcon = statusIcons[status.value]

  if (status.value === 'pending' || (statusIcon && markerVariant.value !== 'dot')) {
    return statusIcon
  }

  return markerVariant.value === 'auto' ? props.icon : undefined
})

// Iconify names (`lucide:check`) render through `Icon`, UnoCSS icon classes (`i-lucide:check`) as a class ~ the
// classes are compiled by UnoCSS, so they need no runtime fetch
function resolveIcon(value?: string) {
  const resolved = resolveIconValue(value)

  return resolved.name?.startsWith('i-')
    ? { classes: `${resolved.name} ${resolved.classes}` }
    : resolved
}

const resolvedMarkerIcon = computed(() => resolveIcon(markerIcon.value))
const resolvedExpandIcon = computed(() => resolveIcon(timeline.props.expandIcon))
const isDot = computed(() => !markerIcon.value && markerVariant.value !== 'number')

// Color ~ a theme color resolves to a class, anything else is passed as a CSS variable
const color = computed(() => props.color ?? timeline.props.color ?? 'primary')
const colorClass = computed(() => {
  return TIMELINE_COMPOSABLE_COLORS[color.value as keyof typeof TIMELINE_COMPOSABLE_COLORS] ?? 'color-[var(--tlc-color)]'
})

const colorStyle = computed(() => {
  return color.value in TIMELINE_COMPOSABLE_COLORS ? undefined : { '--tlc-color': color.value }
})

// Connectors ~ the line leading to the next item is colored once the next item is reached
const isNextReached = computed(() => {
  if (props.status) {
    return props.status === 'completed'
  }

  return !timeline.hasProgress.value || (timeline.activeIndex.value !== -1 && index.value < timeline.activeIndex.value)
})

const stateClasses = computed(() => ({
  [`is-${status.value}`]: true,
  [`is-side-${side.value}`]: true,
  [`is-${lineStyle.value}`]: lineStyle.value !== 'solid',
  'is-first': isFirst.value,
  'is-last': isLast.value,
  'is-dot': isDot.value,
  'is-icon': !!markerIcon.value,
  'is-disabled': isDisabled.value,
  'is-clickable': isClickable.value,
  'is-interactive': isInteractive.value,
  'is-collapsible': isCollapsible.value,
  'is-expanded': expanded.value,
}))

const slotProps = computed<ITimelineComposableItemSlotProps>(() => ({
  status: status.value,
  index: index.value,
  isActive: isActive.value,
  isFirst: isFirst.value,
  isLast: isLast.value,
  side: side.value,
  expanded: expanded.value,
  toggle,
}))

function toggle() {
  expanded.value = !expanded.value
}

function handleClick() {
  if (isClickable.value) {
    timeline.select(props.value)
  }

  if (isCollapsible.value && slots.default) {
    toggle()
  }
}

const classes = computed(() => timeline.classes.value)
</script>

<template>
  <li
    ref="itemEl"
    :class="[stateClasses, classes.itemClass]"
    :style="timeline.props.ui?.itemStyle?.()"
    :aria-current="isActive ? 'step' : undefined"
    :aria-busy="skeleton || status === 'pending' || undefined"
  >
    <!-- Opposite side (time / custom content) -->
    <div
      v-if="hasOpposite && !skeleton"
      :class="[stateClasses, classes.oppositeClass]"
    >
      <slot
        name="opposite"
        v-bind="slotProps"
      >
        <time :class="classes.timeClass">{{ time }}</time>
      </slot>
    </div>

    <!-- Rail: marker + connector to the next item -->
    <div
      :class="[stateClasses, classes.railClass, colorClass]"
      :style="colorStyle"
      aria-hidden="true"
      @click="handleClick"
    >
      <Skeleton
        v-if="skeleton"
        class="shrink-0 rounded-full w-[var(--tlc-marker)] h-[var(--tlc-marker)]"
      />

      <span
        v-else
        :class="[stateClasses, classes.markerClass]"
      >
        <slot
          name="marker"
          v-bind="slotProps"
        >
          <Icon
            v-if="resolvedMarkerIcon.name"
            :name="resolvedMarkerIcon.name"
            :class="[stateClasses, resolvedMarkerIcon.classes, classes.iconClass]"
          />

          <span
            v-else-if="markerIcon"
            :class="[stateClasses, resolvedMarkerIcon.classes, classes.iconClass]"
          />

          <span
            v-else-if="markerVariant === 'number'"
            :class="[stateClasses, classes.iconClass]"
          >
            {{ index + 1 }}
          </span>

          <span
            v-else
            :class="[stateClasses, classes.dotClass]"
          />
        </slot>
      </span>

      <span
        v-if="!isLast"
        :class="[
          classes.connectorClass,
          { 'is-unreached': !isNextReached || skeleton, 'is-dot': isDot, [`is-${lineStyle}`]: lineStyle !== 'solid' },
        ]"
      />
    </div>

    <!-- Content -->
    <div :class="[stateClasses, classes.contentClass]">
      <!-- Skeleton -->
      <template v-if="skeleton">
        <div
          flex="~ col gap-2"
          w="full"
          p="t-1.5"
          :class="isHorizontal ? 'items-center' : side === 'start' ? 'items-end' : 'items-start'"
        >
          <Skeleton
            class="rounded-custom h-3.5 w-2/5 min-w-24"
          />
          <Skeleton
            class="rounded-custom h-3 w-4/5"
          />
          <Skeleton
            class="rounded-custom h-3 w-3/5"
          />
        </div>
      </template>

      <template v-else>
        <!-- Header: title + inline time -->
        <component
          :is="isInteractive ? 'button' : 'div'"
          v-if="hasHeader"
          :type="isInteractive ? 'button' : undefined"
          :class="[stateClasses, classes.headerClass]"
          :aria-expanded="isCollapsible && $slots.default ? expanded : undefined"
          :aria-controls="isCollapsible && $slots.default ? bodyId : undefined"
          :aria-pressed="isClickable ? isActive : undefined"
          @click="handleClick"
        >
          <span
            v-if="title || $slots.title"
            :class="[stateClasses, classes.titleClass]"
          >
            <slot
              name="title"
              v-bind="slotProps"
            >
              {{ title }}
            </slot>

            <template v-if="isCollapsible && $slots.default">
              <Icon
                v-if="resolvedExpandIcon.name"
                :name="resolvedExpandIcon.name"
                :class="[stateClasses, resolvedExpandIcon.classes, classes.expandIconClass]"
              />

              <span
                v-else
                :class="[stateClasses, resolvedExpandIcon.classes, classes.expandIconClass]"
              />
            </template>
          </span>

          <time
            v-if="hasInlineTime"
            :class="classes.timeClass"
          >
            {{ time }}
          </time>
        </component>

        <!-- Description -->
        <div
          v-if="description || $slots.description"
          :class="[stateClasses, classes.descriptionClass]"
        >
          <slot
            name="description"
            v-bind="slotProps"
          >
            {{ description }}
          </slot>
        </div>

        <!-- Body (default slot) ~ collapsible -->
        <div
          v-if="$slots.default"
          :id="bodyId"
          :class="[stateClasses, classes.bodyClass]"
          :inert="isCollapsible && !expanded ? true : undefined"
        >
          <div>
            <div
              class="timeline-composable-body-inner"
              :class="{ 'p-t-2': hasHeader || description }"
            >
              <slot v-bind="slotProps" />
            </div>
          </div>
        </div>

        <span
          v-if="STATUS_LABELS[status]"
          class="sr-only"
        >
          {{ STATUS_LABELS[status] }}
        </span>
      </template>
    </div>
  </li>
</template>
