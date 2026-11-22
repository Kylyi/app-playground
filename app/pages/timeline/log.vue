<script setup lang="ts">
// Types
import type { ITimelineLogItem, ITimelineLogProps } from '~/components/TimelineProto/Log/types/timeline-log-props.type'

type IDemoItem = ITimelineLogItem & {
  id: number
  changes?: Array<{ field: string, from: string, to: string }>
}

// Controls
const itemCount = ref(200)
const pageSize = ref<number>(50)
const simulateLoading = ref(false)
const groupBy = ref<'none' | 'day' | 'month' | 'year' | 'week'>('day')
const customGroupLabel = ref(false)
const stickyHeaders = ref(true)
const collapsible = ref(false)
const showCount = ref(true)
const order = ref<'desc' | 'asc' | 'none'>('desc')
const timeFormat = ref<'auto' | 'relative' | 'absolute'>('auto')
const timePlacement = ref<'gutter' | 'inline' | 'none'>('gutter')
const withSeconds = ref(false)
const customFormatter = ref(false)
const layout = ref<'compact' | 'card'>('compact')
const dense = ref(false)
const marker = ref<'icon' | 'dot' | 'none'>('icon')
const connector = ref(true)
const customTypes = ref(false)
const bodySlot = ref(true)
const loadMore = ref<'button' | 'scroll'>('button')
const uiOverride = ref(false)
const collapsed = ref<string[]>([])

// Sample data ~ deterministic, so toggling controls does not reshuffle it
function createRandom(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647

    return (seed - 1) / 2147483646
  }
}

const ACTORS = ['Jana Nováková', 'Petr Svoboda', 'Alex Morgan', 'Sam Lee', 'Priya Patel', 'System', 'Billing bot']
const PROJECTS = ['Website redesign', 'Q4 budget', 'Mobile app', 'Onboarding', 'Data migration']
const CONTACTS = ['Acme Corp.', 'Globex', 'Initech', 'Umbrella s.r.o.', 'Stark Industries']

const TEMPLATES: Array<{ type: string, weight: number, make: (n: number, pick: <T>(list: T[]) => T) => Partial<IDemoItem> }> = [
  { type: 'created', weight: 4, make: (n, pick) => ({ title: `Created invoice #${n}`, description: `Invoice for ${pick(CONTACTS)}, due in 14 days.` }) },
  { type: 'created', weight: 2, make: (_, pick) => ({ title: `Added contact ${pick(CONTACTS)}` }) },
  { type: 'updated', weight: 5, make: n => ({ title: `Changed due date of invoice #${n}`, changes: [{ field: 'Due date', from: '12. 3.', to: '19. 3.' }] }) },
  { type: 'updated', weight: 3, make: (_, pick) => ({ title: `Renamed project to “${pick(PROJECTS)}”`, changes: [{ field: 'Name', from: 'Untitled', to: pick(PROJECTS) }, { field: 'Owner', from: '—', to: pick(ACTORS) }] }) },
  { type: 'deleted', weight: 2, make: n => ({ title: `Deleted draft #${n}`, description: 'The draft was moved to the trash and will be removed permanently in 30 days.' }) },
  { type: 'comment', weight: 4, make: n => ({ title: `Commented on invoice #${n}`, description: '“Can we split this into two payments? The client asked for net-30 on the second half.”' }) },
  { type: 'status', weight: 3, make: n => ({ title: `Invoice #${n} marked as paid` }) },
  { type: 'warning', weight: 1, make: n => ({ title: `Payment for invoice #${n} is overdue`, description: 'A reminder email was sent to the client automatically.' }) },
  { type: 'error', weight: 1, make: () => ({ title: 'Bank synchronization failed', description: 'The bank API responded with 503. Retrying in 15 minutes.' }) },
  { type: 'deploy', weight: 1, make: n => ({ title: `Deployed release v2.${n % 40}.0`, description: 'All health checks passed.' }) },
]

const TOTAL_WEIGHT = TEMPLATES.reduce((sum, template) => sum + template.weight, 0)

function generateItems(count: number): IDemoItem[] {
  const random = createRandom(42)
  function pick<T>(list: T[]) {
    return list[Math.floor(random() * list.length)]!
  }

  // Spans ~4 months regardless of the count, recent entries are a bit denser
  const avgGap = Math.max(10 * 60_000, (120 * 86_400_000) / Math.max(count, 1))
  let timestamp = Date.now() - 2 * 60_000

  return Array.from({ length: count }, (_, idx) => {
    let roll = random() * TOTAL_WEIGHT
    const template = TEMPLATES.find(template => (roll -= template.weight) < 0) ?? TEMPLATES[0]!
    const item: IDemoItem = {
      id: idx + 1,
      date: new Date(timestamp),
      type: template.type,
      title: '',
      actor: template.type === 'error' ? 'System' : pick(ACTORS),
      ...template.make(1000 + count - idx, pick),
    }

    timestamp -= avgGap * -Math.log(1 - random()) * (idx < 8 ? 0.15 : 1)

    return item
  })
}

const allItems = computed(() => generateItems(itemCount.value))

// Paging & loading
const visibleCount = ref(pageSize.value || Infinity)
const isFetching = ref(false)

watch([itemCount, pageSize], () => {
  visibleCount.value = pageSize.value || Infinity
})

const items = computed(() => allItems.value.slice(0, visibleCount.value))
const hasMore = computed(() => items.value.length < allItems.value.length)

function handleLoadMore() {
  isFetching.value = true

  setTimeout(() => {
    visibleCount.value += pageSize.value || Infinity
    isFetching.value = false
  }, 700)
}

async function reload() {
  visibleCount.value = 0
  isFetching.value = true

  setTimeout(() => {
    visibleCount.value = pageSize.value || Infinity
    isFetching.value = false
  }, 1200)
}

// Props
const types = computed((): ITimelineLogProps['types'] => {
  if (!customTypes.value) {
    return { deploy: { icon: 'i-lucide:rocket', color: 'primary', label: 'Deployment' } }
  }

  return {
    deploy: { icon: 'i-lucide:rocket', color: '#8B5CF6', label: 'Deployment' },
    comment: { icon: 'i-lucide:message-circle-more', color: 'tertiary', label: 'Comment' },
  }
})

const groupByProp = computed<ITimelineLogProps<IDemoItem>['groupBy']>(() => {
  if (groupBy.value !== 'week') {
    return groupBy.value
  }

  // Custom grouping function ~ ISO week
  return ({ date }) => `Week ${$date(date).isoWeek()}, ${$date(date).isoWeekYear()}`
})

const groupLabel = computed<ITimelineLogProps<IDemoItem>['groupLabel']>(() => {
  if (!customGroupLabel.value) {
    return undefined
  }

  return ({ key, items }) => `${key} — ${items.length} ${items.length === 1 ? 'event' : 'events'}`
})

const absoluteFormat = computed<Intl.DateTimeFormatOptions | undefined>(() => {
  return withSeconds.value
    ? { hour: '2-digit', minute: '2-digit', second: '2-digit' }
    : undefined
})

const timeFormatter = computed<ITimelineLogProps<IDemoItem>['timeFormatter']>(() => {
  return customFormatter.value
    ? ({ date }) => $date(date).format('D.M. HH:mm')
    : undefined
})

const ui = computed<ITimelineLogProps['ui']>(() => {
  if (!uiOverride.value) {
    return undefined
  }

  return {
    titleClass: ({ defaults }) => `${defaults.all} font-semibold`,
    groupHeaderClass: ({ defaults }) => `${defaults.all} color-primary! dark:color-sky-300!`,
    markerClass: ({ defaults }) => `${defaults.all} rounded-2!`,
  }
})

// Render time ~ rough measurement of how long the list takes to render
const renderMs = ref<number>()
let renderStart = performance.now()

onMounted(() => {
  requestAnimationFrame(() => {
    renderMs.value = Math.round(performance.now() - renderStart)
  })
})

watch([items, layout, groupBy, dense, marker, timePlacement], () => {
  renderStart = performance.now()
}, { flush: 'pre' })

watch([items, layout, groupBy, dense, marker, timePlacement], () => {
  const start = renderStart

  requestAnimationFrame(() => {
    renderMs.value = Math.round(performance.now() - start)
  })
}, { flush: 'post' })

// Options
const opts = {
  count: [0, 20, 200, 500, 2000].map(value => ({ label: String(value), value })),
  page: [{ label: 'All', value: 0 }, { label: '25', value: 25 }, { label: '50', value: 50 }],
  groupBy: [
    { label: 'None', value: 'none' },
    { label: 'Day', value: 'day' },
    { label: 'Week ƒ', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' },
  ],
  order: [{ label: 'Newest', value: 'desc' }, { label: 'Oldest', value: 'asc' }, { label: 'As is', value: 'none' }],
  timeFormat: [{ label: 'Auto', value: 'auto' }, { label: 'Relative', value: 'relative' }, { label: 'Absolute', value: 'absolute' }],
  timePlacement: [{ label: 'Gutter', value: 'gutter' }, { label: 'Inline', value: 'inline' }, { label: 'None', value: 'none' }],
  layout: [{ label: 'Compact', value: 'compact' }, { label: 'Card', value: 'card' }],
  marker: [{ label: 'Icon', value: 'icon' }, { label: 'Dot', value: 'dot' }, { label: 'None', value: 'none' }],
  loadMore: [{ label: 'Button', value: 'button' }, { label: 'Scroll', value: 'scroll' }],
}
</script>

<template>
  <div
    flex="~ gap-4 items-start"
    p="4"
    h="[calc(100vh-3rem)]"
    min-h="0"
  >
    <!-- Controls -->
    <aside
      flex="~ col gap-4 shrink-0"
      w="76"
      h="full"
      overflow="auto"
      p="4"
      border="1 solid true-gray-200 dark:true-gray-700 rounded-custom"
      bg="true-gray-50 dark:white/3"
      text="sm"
    >
      <div flex="~ col gap-1">
        <h1
          m="0"
          text="lg"
          font="semibold"
        >
          TimelineLog
        </h1>

        <p
          m="0"
          color="ca"
          font="rem-12"
        >
          Grouped activity / audit log
        </p>
      </div>

      <fieldset class="ctl-group">
        <legend>Data</legend>

        <div class="ctl">
          <span>Item count</span>
          <ButtonGroup
            v-model="itemCount"
            variant="segmented"
            :buttons="opts.count"
          />
        </div>

        <div class="ctl">
          <span>Page size (load more)</span>
          <ButtonGroup
            v-model="pageSize"
            variant="segmented"
            :buttons="opts.page"
          />
        </div>

        <div class="ctl">
          <span>Load more</span>
          <ButtonGroup
            v-model="loadMore"
            variant="segmented"
            :buttons="opts.loadMore"
          />
        </div>

        <Toggle
          v-model="simulateLoading"
          label="Simulate loading"
          size="sm"
        />

        <Btn
          label="Reload (skeleton)"
          :icon="['i-lucide:rotate-cw']"
          size="sm"
          outlined
          no-uppercase
          @click="reload"
        />
      </fieldset>

      <fieldset class="ctl-group">
        <legend>Grouping</legend>

        <div class="ctl">
          <span>Group by</span>
          <ButtonGroup
            v-model="groupBy"
            variant="segmented"
            :buttons="opts.groupBy"
          />
        </div>

        <div class="ctl">
          <span>Order</span>
          <ButtonGroup
            v-model="order"
            variant="segmented"
            :buttons="opts.order"
          />
        </div>

        <Toggle
          v-model="stickyHeaders"
          label="Sticky headers"
          size="sm"
        />

        <Toggle
          v-model="collapsible"
          label="Collapsible groups"
          size="sm"
        />

        <Toggle
          v-model="showCount"
          label="Show count"
          size="sm"
        />

        <Toggle
          v-model="customGroupLabel"
          label="Custom groupLabel"
          size="sm"
        />
      </fieldset>

      <fieldset class="ctl-group">
        <legend>Time</legend>

        <div class="ctl">
          <span>Format</span>
          <ButtonGroup
            v-model="timeFormat"
            variant="segmented"
            :buttons="opts.timeFormat"
          />
        </div>

        <div class="ctl">
          <span>Placement</span>
          <ButtonGroup
            v-model="timePlacement"
            variant="segmented"
            :buttons="opts.timePlacement"
          />
        </div>

        <Toggle
          v-model="withSeconds"
          label="absoluteFormat with seconds"
          size="sm"
        />

        <Toggle
          v-model="customFormatter"
          label="Custom timeFormatter"
          size="sm"
        />
      </fieldset>

      <fieldset class="ctl-group">
        <legend>Look</legend>

        <div class="ctl">
          <span>Layout</span>
          <ButtonGroup
            v-model="layout"
            variant="segmented"
            :buttons="opts.layout"
          />
        </div>

        <div class="ctl">
          <span>Marker</span>
          <ButtonGroup
            v-model="marker"
            variant="segmented"
            :buttons="opts.marker"
          />
        </div>

        <Toggle
          v-model="dense"
          label="Dense"
          size="sm"
        />

        <Toggle
          v-model="connector"
          label="Connector line"
          size="sm"
        />

        <Toggle
          v-model="customTypes"
          label="Custom types"
          size="sm"
        />

        <Toggle
          v-model="bodySlot"
          label="Body slot (card: changes)"
          size="sm"
        />

        <Toggle
          v-model="uiOverride"
          label="ui overrides"
          size="sm"
        />
      </fieldset>
    </aside>

    <!-- Demo -->
    <main
      flex="~ col 1"
      min-w="0"
      h="full"
      border="1 solid true-gray-200 dark:true-gray-700 rounded-custom"
      overflow="hidden"
    >
      <header
        flex="~ items-center gap-3"
        p="x-4 y-2"
        border="b-1 b-solid b-true-gray-200 dark:b-true-gray-700"
        font="rem-12"
        color="ca"
      >
        <span>
          <b class="color-darker dark:color-white tabular-nums">{{ items.length }}</b> / {{ allItems.length }} items
        </span>

        <span v-if="renderMs !== undefined">
          · render ≈ <b class="tabular-nums">{{ renderMs }} ms</b>
        </span>

        <span
          v-if="collapsed.length"
          m="l-auto"
        >
          {{ collapsed.length }} collapsed
        </span>
      </header>

      <div
        flex="1"
        overflow="auto"
        p="x-4 b-4"
      >
        <TimelineLog
          v-model:collapsed="collapsed"
          :items
          :group-by="groupByProp"
          :group-label
          :sticky-headers
          :collapsible
          :show-count
          :order
          :time-format
          :time-placement
          :absolute-format
          :time-formatter
          :layout
          :dense
          :marker
          :connector
          :types
          :loading="simulateLoading || isFetching"
          :has-more
          :load-more
          :ui
          max-w="3xl"
          m="x-auto"
          @load-more="handleLoadMore"
        >
          <template
            v-if="bodySlot"
            #body="{ item }"
          >
            <div
              v-if="item.changes"
              flex="~ wrap gap-1.5"
              p="y-0.5"
            >
              <span
                v-for="change in item.changes"
                :key="change.field"
                flex="~ items-center gap-1"
                p="x-1.5 y-0.5"
                rounded="custom"
                bg="true-gray-100 dark:white/6"
                font="rem-11"
              >
                <span color="ca">{{ change.field }}:</span>
                <s color="ca">{{ change.from }}</s>
                <span
                  class="i-lucide:arrow-right"
                  color="ca"
                />
                <span font="medium">{{ change.to }}</span>
              </span>
            </div>
          </template>

          <template #end>
            <span
              class="i-lucide:flag"
              opacity="60"
            />
            <span>Beginning of history</span>
          </template>
        </TimelineLog>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.ctl-group {
  @apply flex flex-col gap-2.5 m-0 p-0 border-none;

  legend {
    @apply p-0 m-b-2 font-rem-11 font-semibold uppercase tracking-wider color-ca;
  }
}

.ctl {
  @apply flex flex-col gap-1;

  > span {
    @apply font-rem-12 color-ca;
  }
}
</style>
