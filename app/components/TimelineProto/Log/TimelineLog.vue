<script setup lang="ts" generic="T extends ITimelineLogItem">
import type { CSSProperties } from 'vue'

// Types
import type {
  ITimelineLogGroup,
  ITimelineLogItem,
  ITimelineLogProps,
  ITimelineLogRow,
  ITimelineLogType,
} from './types/timeline-log-props.type'

// Functions
import {
  formatRelativeTime,
  getDefaultAbsoluteFormat,
  getGroupKey,
  getGroupLabel,
  isWithinDay,
  TIMELINE_LOG_FULL_FORMAT,
  toNativeDate,
} from './functions/timeline-log-format'

// Constants
import {
  TIMELINE_LOG_DEFAULT_PROPS,
  TIMELINE_LOG_DEFAULT_TYPES,
  TIMELINE_LOG_THEME_COLORS,
} from './constants/timeline-log-default-props.constant'

// NOTE: Prototype ~ literal defaults instead of `getComponentProps('timelineLog')`
const props = withDefaults(defineProps<ITimelineLogProps<T>>(), {
  items: () => [],
  itemKey: 'id' as any,
  groupBy: 'day',
  stickyHeaders: true,
  order: 'desc',
  timeFormat: 'auto',
  timePlacement: 'gutter',
  layout: 'compact',
  marker: 'icon',
  connector: true,
  skeletonCount: 5,
  loadMore: 'button',
  loadMoreLabel: 'Load more',
  emptyText: 'No activity yet',
})

const emits = defineEmits<{
  (e: 'load-more'): void
}>()

const slots = defineSlots<{
  'item'?: (props: IRowSlotProps) => any
  'title'?: (props: IRowSlotProps) => any
  'body'?: (props: IRowSlotProps) => any
  'marker'?: (props: IRowSlotProps) => any
  'time'?: (props: IRowSlotProps) => any
  'group-header'?: (props: { group: IGroup, collapsed: boolean, toggle: () => void }) => any
  'empty'?: () => any
  'loading'?: () => any
  'pending'?: () => any
  'load-more'?: (props: { loadMore: () => void }) => any
  'end'?: () => any
}>()

type IRow = ITimelineLogRow<T>
type IGroup = ITimelineLogGroup<T>
type IRowSlotProps = { item: T, row: IRow, group: IGroup, time: string }

/**
 * Keys of the collapsed groups
 */
const collapsed = defineModel<string[]>('collapsed', { default: () => [] })

// Utils
const { currentLocale } = useLocale()
const locale = computed(() => currentLocale.value?.code)

// Relative times tick once a minute, which is the finest unit they show
const now = useNow({ interval: 60_000 })
const nowMs = computed(() => now.value.getTime())

// Types
const typeMap = computed(() => ({ ...TIMELINE_LOG_DEFAULT_TYPES, ...props.types }))

function resolveColor(color?: string) {
  if (!color) {
    return undefined
  }

  return TIMELINE_LOG_THEME_COLORS.has(color) ? `var(--color-${color})` : color
}

function resolveType(item: T): ITimelineLogType {
  const type = typeMap.value[item.type ?? 'default'] ?? typeMap.value.default!

  // Rows without overrides share the type object
  if (!item.icon && !item.color) {
    return type
  }

  return { ...type, icon: item.icon ?? type.icon, color: item.color ?? type.color }
}

// Resolving icons is cached, as most rows share a handful of them
const iconCache = new Map<string, ReturnType<typeof resolveIconValue>>()

function getIcon(icon?: string) {
  if (!icon) {
    return undefined
  }

  let resolved = iconCache.get(icon)

  if (!resolved) {
    // A single UnoCSS icon class renders as pure CSS ~ no `Icon` component instance per row
    resolved = /^i-\S+$/.test(icon) ? { classes: icon } : resolveIconValue(icon)
    iconCache.set(icon, resolved)
  }

  return resolved
}

// Rows ~ parsed & sorted once per `items` change, not on every render
const rows = computed<IRow[]>(() => {
  const result = props.items.map((item, idx) => {
    const date = toNativeDate(item.date)

    return {
      item,
      idx,
      key: (item[props.itemKey] as string | number | undefined) ?? idx,
      date,
      timestamp: date.getTime(),
      type: resolveType(item),
    }
  })

  if (props.order === 'desc') {
    result.sort((a, b) => b.timestamp - a.timestamp)
  } else if (props.order === 'asc') {
    result.sort((a, b) => a.timestamp - b.timestamp)
  }

  return result
})

const groupByMode = computed(() => typeof props.groupBy === 'function' ? 'custom' : props.groupBy)
const hasGroups = computed(() => groupByMode.value !== 'none')

const groups = computed<IGroup[]>(() => {
  const groupBy = props.groupBy

  if (groupBy === 'none') {
    return [{ key: 'all', label: '', rows: rows.value }]
  }

  const groupsByKey = new Map<string, IGroup>()

  for (const row of rows.value) {
    const key = typeof groupBy === 'function'
      ? groupBy({ item: row.item, date: row.date })
      : getGroupKey(row.date, groupBy)

    let group = groupsByKey.get(key)

    if (!group) {
      group = { key, label: '', rows: [] }
      groupsByKey.set(key, group)
    }

    group.rows.push(row)
  }

  // Labels are resolved after grouping, once per group
  return [...groupsByKey.values()].map(group => {
    const date = group.rows[0]!.date

    if (props.groupLabel) {
      group.label = props.groupLabel({ key: group.key, date, items: group.rows.map(row => row.item) })
    } else if (typeof groupBy === 'function') {
      group.label = group.key
    } else {
      group.label = getGroupLabel(date, groupBy, nowMs.value, locale.value)
    }

    return group
  })
})

// Collapsing
const collapsedSet = computed(() => new Set(collapsed.value))

function isCollapsed(group: IGroup) {
  return props.collapsible && collapsedSet.value.has(group.key)
}

function toggleGroup(group: IGroup) {
  collapsed.value = collapsedSet.value.has(group.key)
    ? collapsed.value.filter(key => key !== group.key)
    : [...collapsed.value, group.key]
}

// Time
const absoluteFormat = computed(() => props.absoluteFormat ?? getDefaultAbsoluteFormat(groupByMode.value))

function formatTime(row: IRow) {
  if (props.timeFormatter) {
    return props.timeFormatter({ item: row.item, date: row.date, now: nowMs.value, groupBy: groupByMode.value })
  }

  const isRelative = props.timeFormat === 'relative'
    || (props.timeFormat === 'auto' && isWithinDay(row.date, nowMs.value))

  return isRelative
    ? formatRelativeTime(row.date, nowMs.value, locale.value)
    : getDateTimeFormat(locale.value, absoluteFormat.value).format(row.date)
}

function formatFullTime(row: IRow) {
  return getDateTimeFormat(locale.value, TIMELINE_LOG_FULL_FORMAT).format(row.date)
}

function getSlotProps(row: IRow, group: IGroup): IRowSlotProps {
  return { item: row.item, row, group, time: formatTime(row) }
}

// Loading
const isInitialLoading = computed(() => props.loading && !props.items.length)
const isEmptyState = computed(() => !props.loading && !props.items.length)
const hasFooter = computed(() => !!props.items.length && (props.loading || props.hasMore || !!slots.end))

function requestMore() {
  if (!props.loading && props.hasMore) {
    emits('load-more')
  }
}

// Infinite scroll ~ the sentinel may stay visible after a page is loaded (short pages),
// so the request is repeated whenever loading finishes while it is still in view
const sentinelEl = ref<HTMLElement>()
const isSentinelVisible = ref(false)

useIntersectionObserver(
  sentinelEl,
  ([entry]) => {
    isSentinelVisible.value = !!entry?.isIntersecting
  },
  { rootMargin: '0px 0px 200px 0px' },
)

watch(
  () => isSentinelVisible.value && props.loadMore === 'scroll' && props.hasMore && !props.loading,
  shouldLoad => shouldLoad && emits('load-more'),
)

// Layout
const hasGutter = computed(() => props.timePlacement === 'gutter')
const hasInlineTime = computed(() => props.timePlacement === 'inline')

// The gutter is sized by what the time can contain, overridable through `--tl-gutter` in `ui.containerStyle`
const gutterWidth = computed(() => {
  if (props.timeFormatter) {
    return '6rem'
  }

  // In rem
  const relative = 5
  const absolute = groupByMode.value === 'day' && !props.absoluteFormat ? 4 : 7.5

  switch (props.timeFormat) {
    case 'relative':
      return `${relative}rem`
    case 'absolute':
      return `${absolute}rem`
    default:
      return `${Math.max(relative, absolute)}rem`
  }
})

const railWidth = computed(() => {
  switch (props.marker) {
    case 'icon':
      return props.dense ? '1.125rem' : '1.5rem'
    case 'dot':
      return '0.75rem'
    default:
      return '0px'
  }
})

const layoutVars = computed(() => {
  const lineX = hasGutter.value
    ? 'calc(var(--tl-gutter) + var(--tl-gap) + var(--tl-rail) / 2)'
    : 'calc(var(--tl-rail) / 2)'

  return {
    '--tl-gutter': gutterWidth.value,
    '--tl-rail': railWidth.value,
    '--tl-line-x': lineX,
  } as CSSProperties
})

const stateClasses = computed(() => ({
  'is-dense': props.dense,
  [`is-${props.layout}`]: true,
  'is-gutter': hasGutter.value,
}))

// Styles ~ every class goes through `ui.xxxClass({ defaults })`, falling back to `defaults.all`
type IUi = NonNullable<ITimelineLogProps['ui']>

function resolveUiClass<K extends keyof IUi & `${string}Class`>(key: K, defaults: { all: string }) {
  const fn = props.ui?.[key] as ((payload: { defaults: any }) => ClassType) | undefined

  return fn ? fn({ defaults }) : defaults.all
}

function resolveUiStyle<K extends keyof IUi & `${string}Style`>(key: K) {
  return (props.ui?.[key] as (() => CSSProperties) | undefined)?.()
}

const ui = TIMELINE_LOG_DEFAULT_PROPS.ui

const containerClass = computed(() => resolveUiClass('containerClass', ui.containerClass({ dense: !!props.dense })))
const groupClass = computed(() => resolveUiClass('groupClass', ui.groupClass()))
const groupHeaderClass = computed(() => {
  return resolveUiClass('groupHeaderClass', ui.groupHeaderClass({ sticky: props.stickyHeaders, collapsible: !!props.collapsible }))
})
const listClass = computed(() => {
  return resolveUiClass('listClass', ui.listClass({ connector: props.connector && props.marker !== 'none' }))
})
const itemClass = computed(() => resolveUiClass('itemClass', ui.itemClass({ layout: props.layout, dense: !!props.dense })))
const timeClass = computed(() => {
  return resolveUiClass('timeClass', ui.timeClass({ layout: props.layout, placement: hasGutter.value ? 'gutter' : 'inline' }))
})
const markerClass = computed(() => {
  return resolveUiClass('markerClass', ui.markerClass({ marker: props.marker, layout: props.layout, dense: !!props.dense }))
})
const contentClass = computed(() => resolveUiClass('contentClass', ui.contentClass({ layout: props.layout })))
const titleClass = computed(() => resolveUiClass('titleClass', ui.titleClass({ layout: props.layout })))
const descriptionClass = computed(() => resolveUiClass('descriptionClass', ui.descriptionClass()))
const footerClass = computed(() => resolveUiClass('footerClass', ui.footerClass()))

const containerStyle = computed(() => resolveUiStyle('containerStyle'))
const groupStyle = computed(() => resolveUiStyle('groupStyle'))
const groupHeaderStyle = computed(() => resolveUiStyle('groupHeaderStyle'))
const listStyle = computed(() => resolveUiStyle('listStyle'))
const itemStyle = computed(() => resolveUiStyle('itemStyle'))
const timeStyle = computed(() => resolveUiStyle('timeStyle'))
const markerStyle = computed(() => resolveUiStyle('markerStyle'))
const contentStyle = computed(() => resolveUiStyle('contentStyle'))
const titleStyle = computed(() => resolveUiStyle('titleStyle'))
const descriptionStyle = computed(() => resolveUiStyle('descriptionStyle'))
const footerStyle = computed(() => resolveUiStyle('footerStyle'))

const uid = useId()
</script>

<template>
  <div
    :class="[stateClasses, containerClass]"
    :style="[layoutVars, containerStyle]"
    :aria-busy="loading || undefined"
  >
    <!-- Initial loading -->
    <template v-if="isInitialLoading">
      <slot name="loading">
        <ol
          :class="listClass"
          :style="listStyle"
          aria-hidden="true"
        >
          <li
            v-for="n in skeletonCount"
            :key="n"
            :class="itemClass"
          >
            <span
              v-if="hasGutter"
              :class="timeClass"
            >
              <Skeleton class="w-10 h-2.5! rounded-full overflow-hidden font-rem-0" />
            </span>

            <span
              v-if="marker !== 'none'"
              :class="markerClass"
              style="--tl-color: rgb(163 163 163)"
            />

            <div :class="contentClass">
              <Skeleton
                class="h-3! rounded-full overflow-hidden font-rem-0"
                :style="{ width: `${40 + ((n * 37) % 45)}%` }"
              />

              <Skeleton
                v-if="layout === 'card'"
                class="h-2.5! w-4/5 rounded-full overflow-hidden text-0 m-t-1"
              />
            </div>
          </li>
        </ol>
      </slot>
    </template>

    <!-- Empty -->
    <div
      v-else-if="isEmptyState"
      flex="~ col center gap-2"
      p="y-10"
      color="ca"
      text="center sm"
    >
      <slot name="empty">
        <span
          class="i-lucide:history"
          text="2xl"
          opacity="60"
        />
        <span>{{ emptyText }}</span>
      </slot>
    </div>

    <!-- Groups -->
    <template v-else>
      <section
        v-for="(group, groupIdx) in groups"
        :key="group.key"
        :class="[{ 'is-collapsed': isCollapsed(group) }, groupClass]"
        :style="groupStyle"
        :aria-labelledby="hasGroups ? `${uid}-g${groupIdx}` : undefined"
      >
        <!-- Group header -->
        <h3
          v-if="hasGroups"
          :id="`${uid}-g${groupIdx}`"
          :class="groupHeaderClass"
          :style="groupHeaderStyle"
        >
          <slot
            name="group-header"
            :group
            :collapsed="isCollapsed(group)"
            :toggle="() => toggleGroup(group)"
          >
            <component
              :is="collapsible ? 'button' : 'span'"
              :type="collapsible ? 'button' : undefined"
              :aria-expanded="collapsible ? !isCollapsed(group) : undefined"
              :aria-controls="collapsible ? `${uid}-g${groupIdx}-list` : undefined"
              class="flex items-center gap-2 flex-1 min-w-0 p-0 border-none bg-transparent color-inherit font-inherit tracking-inherit uppercase text-left"
              :class="{ 'cursor-pointer outline-none rounded-custom focus-visible:(ring-2 ring-primary/50)': collapsible }"
              @click="collapsible && toggleGroup(group)"
            >
              <span
                v-if="collapsible"
                class="i-lucide:chevron-down shrink-0 transition-transform duration-200"
                :class="{ '-rotate-90': isCollapsed(group) }"
              />

              <span truncate>{{ group.label }}</span>

              <span
                v-if="showCount"
                p="x-1.5"
                rounded="full"
                bg="true-gray-100 dark:true-gray-800"
                font="rem-10 medium"
                tracking="normal"
                leading="4"
                tabular-nums
              >
                {{ group.rows.length }}
              </span>

              <span
                flex="1"
                h="px"
                bg="true-gray-200 dark:true-gray-700/70"
              />
            </component>
          </slot>
        </h3>

        <!-- Items -->
        <ol
          v-if="!isCollapsed(group)"
          :id="`${uid}-g${groupIdx}-list`"
          :class="listClass"
          :style="listStyle"
        >
          <li
            v-for="(row, idx) in group.rows"
            :key="row.key"
            :class="[{ 'is-first': idx === 0, 'is-last': idx === group.rows.length - 1 }, itemClass]"
            :style="[{ '--tl-color': resolveColor(row.type.color) }, itemStyle]"
          >
            <!-- Time (gutter) -->
            <time
              v-if="hasGutter"
              :datetime="row.date.toISOString()"
              :title="formatFullTime(row)"
              :class="timeClass"
              :style="timeStyle"
            >
              <slot
                name="time"
                v-bind="getSlotProps(row, group)"
              >
                {{ formatTime(row) }}
              </slot>
            </time>

            <!-- Marker -->
            <span
              v-if="marker !== 'none'"
              :class="markerClass"
              :style="markerStyle"
              role="img"
              :aria-label="row.type.label"
            >
              <slot
                name="marker"
                v-bind="getSlotProps(row, group)"
              >
                <template v-if="marker === 'icon' && getIcon(row.type.icon)">
                  <Icon
                    v-if="getIcon(row.type.icon)!.name"
                    :name="getIcon(row.type.icon)!.name!"
                    :class="getIcon(row.type.icon)!.classes"
                  />

                  <span
                    v-else
                    :class="getIcon(row.type.icon)!.classes"
                  />
                </template>
              </slot>
            </span>

            <!-- Content -->
            <div
              :class="contentClass"
              :style="contentStyle"
            >
              <slot
                name="item"
                v-bind="getSlotProps(row, group)"
              >
                <!-- Compact: one line -->
                <template v-if="layout === 'compact'">
                  <span
                    :class="titleClass"
                    :style="titleStyle"
                    :title="row.item.description"
                  >
                    <slot
                      name="title"
                      v-bind="getSlotProps(row, group)"
                    >
                      {{ row.item.title }}
                    </slot>
                  </span>

                  <span
                    v-if="row.item.actor"
                    truncate
                    shrink="[3]"
                    color="ca"
                    font="rem-12"
                  >
                    · {{ row.item.actor }}
                  </span>

                  <time
                    v-if="hasInlineTime"
                    :datetime="row.date.toISOString()"
                    :title="formatFullTime(row)"
                    :class="timeClass"
                    :style="timeStyle"
                    m="l-auto"
                  >
                    <slot
                      name="time"
                      v-bind="getSlotProps(row, group)"
                    >
                      {{ formatTime(row) }}
                    </slot>
                  </time>
                </template>

                <!-- Card: title row, description, body, meta -->
                <template v-else>
                  <div
                    flex="~ items-center gap-2"
                    min-h="[var(--tl-line)]"
                  >
                    <span
                      :class="titleClass"
                      :style="titleStyle"
                    >
                      <slot
                        name="title"
                        v-bind="getSlotProps(row, group)"
                      >
                        {{ row.item.title }}
                      </slot>
                    </span>

                    <time
                      v-if="hasInlineTime"
                      :datetime="row.date.toISOString()"
                      :title="formatFullTime(row)"
                      :class="timeClass"
                      :style="timeStyle"
                      m="l-auto"
                    >
                      <slot
                        name="time"
                        v-bind="getSlotProps(row, group)"
                      >
                        {{ formatTime(row) }}
                      </slot>
                    </time>
                  </div>

                  <p
                    v-if="row.item.description"
                    :class="descriptionClass"
                    :style="descriptionStyle"
                    m="0"
                  >
                    {{ row.item.description }}
                  </p>

                  <slot
                    name="body"
                    v-bind="getSlotProps(row, group)"
                  />

                  <div
                    v-if="row.item.actor || row.type.label"
                    flex="~ items-center gap-1.5"
                    font="rem-12"
                    color="ca"
                    p="b-1"
                  >
                    <template v-if="row.item.actor">
                      <span class="i-lucide:user-round shrink-0" />
                      <span truncate>{{ row.item.actor }}</span>
                      <span opacity="50">·</span>
                    </template>

                    <span
                      class="color-[var(--tl-color)] dark:color-[color-mix(in_srgb,var(--tl-color)_65%,white)]"
                      font="medium"
                    >
                      {{ row.type.label }}
                    </span>
                  </div>
                </template>
              </slot>
            </div>
          </li>
        </ol>
      </section>

      <!-- Footer: pending indicator, load more, end -->
      <div
        v-if="hasFooter"
        :class="footerClass"
        :style="footerStyle"
        aria-live="polite"
      >
        <template v-if="loading">
          <slot name="pending">
            <span class="i-svg-spinners:180-ring-with-bg" />
            <span>Loading…</span>
          </slot>
        </template>

        <template v-else-if="hasMore">
          <slot
            name="load-more"
            :load-more="requestMore"
          >
            <Btn
              v-if="loadMore === 'button'"
              :label="loadMoreLabel"
              :icon="['i-lucide:chevrons-down']"
              size="sm"
              outlined
              no-uppercase
              @click="requestMore"
            />
          </slot>
        </template>

        <slot
          v-else
          name="end"
        />
      </div>

      <!-- Infinite scroll trigger -->
      <div
        v-if="loadMore === 'scroll' && hasMore && items.length"
        ref="sentinelEl"
        h="px"
        aria-hidden="true"
      />
    </template>
  </div>
</template>
