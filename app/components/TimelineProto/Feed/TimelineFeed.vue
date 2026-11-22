<script setup lang="ts" generic="T extends ITimelineFeedItem">
import type { CSSProperties } from 'vue'

// Types
import type {
  ITimelineFeedColor,
  ITimelineFeedItem,
  ITimelineFeedProps,
  ITimelineFeedSlotProps,
} from './types/timeline-feed-props.type'

// Constants
import { TIMELINE_FEED_DEFAULT_PROPS } from './constants/timeline-feed-default-props.constant'

// NOTE: In the real component, these come from `getComponentProps('timelineFeed')` and
// `getComponentMergedProps(...)`; the prototype falls back to `defaults.all` instead
const props = withDefaults(defineProps<ITimelineFeedProps<T>>(), {
  color: 'primary',
  connector: 'solid',
  connectorColor: 'neutral',
  marker: 'auto',
  markerAlign: 'start',
  pending: false,
  pendingIcon: 'i-lucide:loader-circle',
  side: 'end',
  size: 'md',
  variant: 'filled',
})

const slots = defineSlots<{
  /** Content of the marker */
  marker?: (props: ISlotProps) => any
  /** The title */
  title?: (props: ISlotProps) => any
  /** The time, both inline and in the opposite column */
  time?: (props: ISlotProps) => any
  /** The whole opposite column (requires `opposite`) */
  opposite?: (props: ISlotProps) => any
  /** The description */
  description?: (props: ISlotProps) => any
  /** Rich content below the description, an item with `slot: 'name'` uses the `name` slot instead */
  content?: (props: ISlotProps) => any
  /** Replaces a connector segment, `position` is `before` (above the marker) or `after` */
  connector?: (props: ISlotProps & { position: 'before' | 'after', isPending: boolean }) => any
  /** Per-item content slots, named by the item's `slot` */
  [key: string]: ((props: any) => any) | undefined
}>()

type ISlotProps = ITimelineFeedSlotProps<T>

// Utils
const THEME_COLORS = new Set(['primary', 'secondary', 'positive', 'negative', 'warning', 'info'])
const NEUTRAL_COLOR = '#a3a3a3'

function resolveColor(color: ITimelineFeedColor) {
  if (THEME_COLORS.has(color)) {
    return `var(--color-${color})`
  }

  return color === 'neutral' ? NEUTRAL_COLOR : color
}

function resolveMarker(item: T) {
  if (item.pending) {
    return 'icon'
  }

  const marker = item.marker ?? props.marker

  // A custom `#marker` slot gets the full marker size, unless dots are explicitly requested
  if (slots.marker && marker !== 'dot') {
    return 'custom'
  }

  switch (marker) {
    case 'auto':
      return item.avatar ? 'avatar' : item.icon ? 'icon' : 'dot'
    case 'avatar':
      return item.avatar ? 'avatar' : 'dot'
    case 'icon':
      return item.icon ? 'icon' : 'dot'
    default:
      return marker
  }
}

// PROTOTYPE: a lone UnoCSS icon class (`i-lucide:x`) renders as a class, Nuxt Icon cannot fetch icons in the sandbox
function resolveIcon(icon?: string) {
  return icon?.startsWith('i-') ? { classes: icon, name: undefined } : resolveIconValue(icon)
}

// Layout
const size = computed(() => props.size ?? 'md')

/**
 * Everything an item needs to render, resolved in one pass ~ no per-item watchers or computeds
 */
const entries = computed(() => {
  const source = props.items.map((item, originalIdx) => ({ item, originalIdx }))

  if (props.pending) {
    const pendingItem = {
      id: '__pending',
      title: typeof props.pending === 'string' ? props.pending : undefined,
      icon: props.pendingIcon,
      pending: true,
    } as T

    source.push({ item: pendingItem, originalIdx: -1 })
  }

  if (props.reverse) {
    source.reverse()
  }

  const colors = source.map(({ item }) => {
    return item.muted ? NEUTRAL_COLOR : resolveColor(item.color ?? props.color)
  })

  return source.map(({ item, originalIdx }, idx) => {
    const isFirst = idx === 0
    const isLast = idx === source.length - 1
    const prev = source[idx - 1]?.item
    const next = source[idx + 1]?.item

    const side: 'start' | 'end' = props.side === 'alternate'
      ? item.side ?? (idx % 2 === 0 ? 'end' : 'start')
      : props.side

    const marker = resolveMarker(item)
    const variant = item.variant ?? props.variant

    const classes = {
      [`is-${side}`]: true,
      [`is-${marker}`]: true,
      [`is-${variant}`]: true,
      'is-first': isFirst,
      'is-last': isLast,
      'is-pending': !!item.pending,
      'is-muted': !!item.muted,
    }

    const style = {
      '--tl-color': colors[idx],
      '--tl-prev-color': colors[idx - 1] ?? colors[idx],
    } as CSSProperties

    const slotProps: ISlotProps = { item, idx, originalIdx, side, isFirst, isLast }

    return {
      key: item.id,
      item,
      marker,
      classes,
      style,
      slotProps,
      icon: resolveIcon(item.icon),
      number: originalIdx + 1,
      // A connector is dashed when either item it connects is pending
      isBeforePending: !!(item.pending || prev?.pending),
      isAfterPending: !!(item.pending || next?.pending),
    }
  })
})

const dotsOnly = computed(() => props.marker === 'dot')

// Styles - container
const containerClass = computed(() => {
  const defaults = TIMELINE_FEED_DEFAULT_PROPS.ui.containerClass({
    side: props.side,
    size: size.value,
    dense: !!props.dense,
    dotsOnly: dotsOnly.value,
  })

  return props.ui?.containerClass?.({ defaults }) ?? defaults.all
})

const containerStyle = computed(() => {
  return props.ui?.containerStyle?.()
})

// Styles - item
const itemClass = computed(() => {
  const defaults = TIMELINE_FEED_DEFAULT_PROPS.ui.itemClass()

  return props.ui?.itemClass?.({ defaults }) ?? defaults.all
})

function getItemStyle(entry: typeof entries.value[number]) {
  const custom = props.ui?.itemStyle?.({ item: entry.item, idx: entry.slotProps.idx })

  return custom ? { ...entry.style, ...custom } : entry.style
}

// Styles - opposite
const oppositeClass = computed(() => {
  const defaults = TIMELINE_FEED_DEFAULT_PROPS.ui.oppositeClass({ markerAlign: props.markerAlign })

  return props.ui?.oppositeClass?.({ defaults }) ?? defaults.all
})

// Styles - rail
const railClass = computed(() => {
  const defaults = TIMELINE_FEED_DEFAULT_PROPS.ui.railClass()

  return props.ui?.railClass?.({ defaults }) ?? defaults.all
})

// Styles - marker
const markerClass = computed(() => {
  const defaults = TIMELINE_FEED_DEFAULT_PROPS.ui.markerClass({ size: size.value })

  return props.ui?.markerClass?.({ defaults }) ?? defaults.all
})

// Styles - icon
const iconClass = computed(() => {
  const defaults = TIMELINE_FEED_DEFAULT_PROPS.ui.iconClass()

  return props.ui?.iconClass?.({ defaults }) ?? defaults.all
})

// Styles - connector
const connectorClass = computed(() => {
  const defaults = TIMELINE_FEED_DEFAULT_PROPS.ui.connectorClass({
    connector: props.connector,
    connectorColor: props.connectorColor,
    markerAlign: props.markerAlign,
  })

  return props.ui?.connectorClass?.({ defaults }) ?? defaults.all
})

// Styles - content
const contentClass = computed(() => {
  const defaults = TIMELINE_FEED_DEFAULT_PROPS.ui.contentClass({ markerAlign: props.markerAlign })

  return props.ui?.contentClass?.({ defaults }) ?? defaults.all
})

// Styles - header
const headerClass = computed(() => {
  const defaults = TIMELINE_FEED_DEFAULT_PROPS.ui.headerClass()

  return props.ui?.headerClass?.({ defaults }) ?? defaults.all
})

// Styles - title
const titleClass = computed(() => {
  const defaults = TIMELINE_FEED_DEFAULT_PROPS.ui.titleClass({ size: size.value })

  return props.ui?.titleClass?.({ defaults }) ?? defaults.all
})

// Styles - time
const timeClass = computed(() => {
  const defaults = TIMELINE_FEED_DEFAULT_PROPS.ui.timeClass({ size: size.value })

  return props.ui?.timeClass?.({ defaults }) ?? defaults.all
})

// Styles - description
const descriptionClass = computed(() => {
  const defaults = TIMELINE_FEED_DEFAULT_PROPS.ui.descriptionClass({ size: size.value, dense: !!props.dense })

  return props.ui?.descriptionClass?.({ defaults }) ?? defaults.all
})

// Styles - body
const bodyClass = computed(() => {
  const defaults = TIMELINE_FEED_DEFAULT_PROPS.ui.bodyClass({ dense: !!props.dense })

  return props.ui?.bodyClass?.({ defaults }) ?? defaults.all
})

// An item can point to its own slot (`slot: 'release'`), otherwise the shared `content` slot is used
function getBodySlotName(item: T) {
  return item.slot && slots[item.slot] ? item.slot : 'content'
}
</script>

<template>
  <ol
    class="timeline-feed"
    :class="[`timeline-feed--${side}`, containerClass]"
    :style="containerStyle"
    :reversed="reverse || undefined"
  >
    <li
      v-for="entry in entries"
      :key="entry.key"
      class="timeline-feed-item"
      :class="[entry.classes, itemClass]"
      :style="getItemStyle(entry)"
      :aria-busy="entry.item.pending || undefined"
    >
      <!-- Opposite -->
      <div
        v-if="opposite"
        class="timeline-feed-opposite"
        :class="[entry.classes, oppositeClass]"
      >
        <slot
          name="opposite"
          v-bind="entry.slotProps"
        >
          <time
            v-if="entry.item.time || slots.time"
            :datetime="entry.item.datetime"
            :class="timeClass"
          >
            <slot
              name="time"
              v-bind="entry.slotProps"
            >
              {{ entry.item.time }}
            </slot>
          </time>
        </slot>
      </div>

      <!-- Rail: connector above, marker, connector below -->
      <div
        class="timeline-feed-rail"
        :class="[entry.classes, railClass]"
        aria-hidden="true"
      >
        <slot
          name="connector"
          v-bind="entry.slotProps"
          position="before"
          :is-pending="entry.isBeforePending"
        >
          <span
            class="timeline-feed-connector is-before"
            :class="[entry.classes, { 'is-pending': entry.isBeforePending }, connectorClass]"
          />
        </slot>

        <span
          class="timeline-feed-marker"
          :class="[entry.classes, markerClass]"
        >
          <slot
            name="marker"
            v-bind="entry.slotProps"
          >
            <img
              v-if="entry.marker === 'avatar'"
              :src="entry.item.avatar"
              alt=""
              loading="lazy"
              class="w-full h-full rounded-full object-cover"
            >

            <template v-else-if="entry.marker === 'icon'">
              <Icon
                v-if="entry.icon.name"
                :name="entry.icon.name"
                :class="[entry.classes, entry.icon.classes, iconClass]"
              />

              <span
                v-else
                :class="[entry.classes, entry.icon.classes, iconClass]"
              />
            </template>

            <template v-else-if="entry.marker === 'number'">
              {{ entry.number }}
            </template>
          </slot>
        </span>

        <slot
          name="connector"
          v-bind="entry.slotProps"
          position="after"
          :is-pending="entry.isAfterPending"
        >
          <span
            class="timeline-feed-connector is-after"
            :class="[entry.classes, { 'is-pending': entry.isAfterPending }, connectorClass]"
          />
        </slot>
      </div>

      <!-- Content -->
      <div
        class="timeline-feed-content"
        :class="[entry.classes, contentClass]"
      >
        <div
          v-if="entry.item.title || slots.title || (!opposite && (entry.item.time || slots.time))"
          class="timeline-feed-header"
          :class="[entry.classes, headerClass]"
        >
          <span
            class="timeline-feed-title"
            :class="[entry.classes, titleClass]"
          >
            <slot
              name="title"
              v-bind="entry.slotProps"
            >
              {{ entry.item.title }}
            </slot>
          </span>

          <time
            v-if="!opposite && (entry.item.time || slots.time)"
            class="timeline-feed-time"
            :datetime="entry.item.datetime"
            :class="[entry.classes, timeClass]"
          >
            <slot
              name="time"
              v-bind="entry.slotProps"
            >
              {{ entry.item.time }}
            </slot>
          </time>
        </div>

        <p
          v-if="entry.item.description || slots.description"
          class="timeline-feed-description"
          :class="[entry.classes, descriptionClass]"
        >
          <slot
            name="description"
            v-bind="entry.slotProps"
          >
            {{ entry.item.description }}
          </slot>
        </p>

        <div
          v-if="slots[getBodySlotName(entry.item)]"
          class="timeline-feed-body"
          :class="[entry.classes, bodyClass]"
        >
          <slot
            :name="getBodySlotName(entry.item)"
            v-bind="entry.slotProps"
          />
        </div>
      </div>
    </li>
  </ol>
</template>
