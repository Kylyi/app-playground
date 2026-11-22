<script setup lang="ts">
// Types
import type { ITimelineComposableProps, ITimelineComposableValue } from '~/components/TimelineProto/Composable/types/timeline-composable-props.type'

type IControlKey = 'orientation' | 'side' | 'timePlacement' | 'size' | 'marker' | 'color' | 'lineStyle' | 'lineWidth'

// Controls ~ every timeline prop can be changed live
const state = reactive({
  orientation: 'vertical' as NonNullable<ITimelineComposableProps['orientation']>,
  side: 'end' as NonNullable<ITimelineComposableProps['side']>,
  timePlacement: 'inline' as NonNullable<ITimelineComposableProps['timePlacement']>,
  size: 'md' as NonNullable<ITimelineComposableProps['size']>,
  marker: 'auto' as NonNullable<ITimelineComposableProps['marker']>,
  color: 'primary',
  lineStyle: 'solid' as NonNullable<ITimelineComposableProps['lineStyle']>,
  lineWidth: 2,
  current: 'merge' as string,
  itemWidth: '12rem',
  clickable: true,
  collapsible: false,
  disabled: false,
  loading: false,
  pending: false,
  completedIcon: false,
  errorIcon: true,
  scrollToActive: true,
  perItemColors: true,
  forceError: false,
})

const segmentedControls: Array<{ key: IControlKey, label: string, options: Array<string | number> }> = [
  { key: 'orientation', label: 'orientation', options: ['vertical', 'horizontal'] },
  { key: 'side', label: 'side', options: ['start', 'end', 'alternate'] },
  { key: 'timePlacement', label: 'timePlacement', options: ['inline', 'opposite'] },
  { key: 'size', label: 'size', options: ['xs', 'sm', 'md', 'lg'] },
  { key: 'marker', label: 'marker', options: ['auto', 'dot', 'number'] },
  { key: 'color', label: 'color', options: ['primary', 'secondary', 'positive', 'warning', 'neutral', '#8b5cf6'] },
  { key: 'lineStyle', label: 'lineStyle', options: ['solid', 'dashed', 'dotted'] },
  { key: 'lineWidth', label: 'lineWidth', options: [1, 2, 3, 4] },
]

const toggleControls = [
  { key: 'clickable', label: 'clickable' },
  { key: 'collapsible', label: 'collapsible' },
  { key: 'disabled', label: 'disabled' },
  { key: 'loading', label: 'loading (skeleton)' },
  { key: 'pending', label: 'pending item' },
  { key: 'completedIcon', label: 'completedIcon (check)' },
  { key: 'errorIcon', label: 'errorIcon (x)' },
  { key: 'scrollToActive', label: 'scrollToActive' },
  { key: 'perItemColors', label: 'per-item colors (demo)' },
  { key: 'forceError', label: 'status="error" on tests (demo)' },
] as const

function toButtons(options: Array<string | number>) {
  return options.map(option => ({ label: String(option), value: option }))
}

// Project history ~ the fully controlled demo
const history = ref([
  {
    value: 'created',
    title: 'Project created',
    time: 'Mar 2, 2026',
    icon: 'i-lucide:folder-plus',
    color: 'neutral',
    author: { name: 'Anna Novak', initials: 'AN', color: 'bg-sky-600' },
    text: 'Initial repository scaffolded from the Nuxt layer template.',
  },
  {
    value: 'review',
    title: 'Design review',
    time: 'Mar 9, 2026',
    icon: 'i-lucide:pen-tool',
    color: 'secondary',
    author: { name: 'Petr Svoboda', initials: 'PS', color: 'bg-pink-600' },
    text: 'Agreed on a template-driven API mirroring Stepper / Step.',
    reviewers: [
      { initials: 'AN', color: 'bg-sky-600' },
      { initials: 'JK', color: 'bg-amber-600' },
      { initials: 'MD', color: 'bg-emerald-600' },
    ],
  },
  {
    value: 'merge',
    title: 'Merged PR #482 — Timeline component',
    time: 'Mar 18, 2026',
    icon: 'i-lucide:git-merge',
    color: 'primary',
    author: { name: 'Jana Kralova', initials: 'JK', color: 'bg-amber-600' },
    text: '12 files changed',
    diff: { added: 640, removed: 87 },
    labels: ['feature', 'ui'],
  },
  {
    value: 'staging',
    title: 'Deployed to staging',
    time: 'Mar 19, 2026',
    icon: 'i-lucide:server',
    color: 'info',
    author: { name: 'CI', initials: 'CI', color: 'bg-true-gray-500' },
    text: 'Build #1934 · 2m 41s',
  },
  {
    value: 'tests',
    title: 'E2E tests',
    time: 'Mar 20, 2026',
    icon: 'i-lucide:flask-conical',
    color: 'warning',
    author: { name: 'CI', initials: 'CI', color: 'bg-true-gray-500' },
    text: '214 passed · 3 flaky retries',
  },
  {
    value: 'release',
    title: 'Production release v2.3.0',
    time: 'Mar 24, 2026',
    icon: 'i-lucide:rocket',
    color: 'positive',
    author: { name: 'Martin Dvorak', initials: 'MD', color: 'bg-emerald-600' },
    text: 'Rolled out to 100 % of tenants.',
  },
])

const currentButtons = computed(() => [
  { label: 'off', value: '__off' },
  { label: 'null', value: '__null' },
  ...history.value.map(item => ({ label: item.value, value: item.value })),
])

const historyModel = computed<ITimelineComposableValue | null | undefined>({
  get: () => state.current === '__off' ? undefined : state.current === '__null' ? null : state.current,
  set: value => state.current = value === undefined ? '__off' : value === null ? '__null' : String(value),
})

// Rich slot content follows the item's side (slot prop) ~ the timeline only aligns its own texts
function alignClass(side: 'start' | 'end') {
  if (state.orientation === 'horizontal') {
    return { items: 'items-center', justify: 'justify-center' }
  }

  return side === 'start'
    ? { items: 'items-end', justify: 'justify-end' }
    : { items: 'items-start', justify: 'justify-start' }
}

const historyEl = useTemplateRef<{ next: () => void, prev: () => void, activeIndex: number, count: number }>('historyEl')
const lastSelect = ref<string>()

const historyProps = computed<ITimelineComposableProps>(() => ({
  orientation: state.orientation,
  side: state.side,
  timePlacement: state.timePlacement,
  size: state.size,
  marker: state.marker,
  color: state.color,
  lineStyle: state.lineStyle,
  lineWidth: state.lineWidth,
  itemWidth: state.itemWidth,
  clickable: state.clickable,
  collapsible: state.collapsible,
  disabled: state.disabled,
  loading: state.loading,
  pending: state.pending ? 'Waiting for the next deploy…' : false,
  completedIcon: state.completedIcon ? 'i-lucide:check' : undefined,
  errorIcon: state.errorIcon ? 'i-lucide:x' : undefined,
  scrollToActive: state.scrollToActive,
}))

// Roadmap ~ horizontal
const releases = [
  { value: 'v1.0', title: 'v1.0 — Launch', time: 'Jan 2025', icon: 'i-lucide:flag', text: 'Public launch with the core component set.' },
  { value: 'v1.5', title: 'v1.5 — Forms', time: 'Apr 2025', icon: 'i-lucide:text-cursor-input', text: 'Form, Field and validation rework.' },
  { value: 'v2.0', title: 'v2.0 — Nuxt 4', time: 'Sep 2025', icon: 'i-lucide:layers', text: 'Migrated to Nuxt 4 layers and UnoCSS presets.' },
  { value: 'v2.3', title: 'v2.3 — Timeline', time: 'Mar 2026', icon: 'i-lucide:git-commit-horizontal', text: 'Timeline, Stepper polish, ButtonGroup segmented variant.' },
  { value: 'v2.5', title: 'v2.5 — Charts', time: 'Jun 2026', icon: 'i-lucide:chart-line', text: 'Lightweight chart primitives.' },
  { value: 'v3.0', title: 'v3.0 — Vapor', time: 'Q4 2026', icon: 'i-lucide:sparkles', text: 'Vue Vapor mode ready components.' },
  { value: 'v3.1', title: 'v3.1 — A11y audit', time: '2027', icon: 'i-lucide:accessibility', text: 'Full WCAG 2.2 audit across the library.' },
]

const roadmapModel = ref<ITimelineComposableValue>('v2.3')
const roadmapEl = useTemplateRef<{ next: () => void, prev: () => void }>('roadmapEl')
const roadmapSide = ref<'start' | 'end' | 'alternate'>('alternate')
const selectedRelease = computed(() => releases.find(release => release.value === roadmapModel.value))

// Order tracking ~ vertical, rich slots
const order = [
  { value: 'placed', title: 'Order placed', time: 'Nov 18 · 09:12', icon: 'i-lucide:shopping-cart' },
  { value: 'paid', title: 'Payment confirmed', time: 'Nov 18 · 09:13', icon: 'i-lucide:credit-card' },
  { value: 'packed', title: 'Packed', time: 'Nov 19 · 14:40', icon: 'i-lucide:package' },
  { value: 'shipped', title: 'Shipped', time: 'Nov 20 · 08:05', icon: 'i-lucide:truck' },
  { value: 'out', title: 'Out for delivery', time: 'Expected Nov 23', icon: 'i-lucide:map-pin' },
  { value: 'delivered', title: 'Delivered', time: '', icon: 'i-lucide:house' },
]

const orderModel = ref<ITimelineComposableValue>('shipped')
const orderLoading = ref(false)

function reloadOrder() {
  orderLoading.value = true
  setTimeout(() => orderLoading.value = false, 1500)
}
</script>

<template>
  <div
    class="timeline-composable-page"
    grid="~ gap-6 lg:cols-[20rem_minmax(0,1fr)]"
    p="4"
    items="start"
  >
    <!-- Controls -->
    <aside
      flex="~ col gap-3"
      p="4"
      border="1 ca rounded-custom"
      bg="white dark:darker"
      lg="sticky top-4 max-h-[calc(100vh-2rem)] overflow-auto"
    >
      <div flex="~ col gap-0.5">
        <h1
          text="lg"
          font="semibold"
          m="0"
        >
          Timeline — Composable
        </h1>
        <span text="xs ca">
          <code>&lt;TimelineComposable&gt;</code> + <code>&lt;TimelineComposableItem&gt;</code>; controls drive the
          "Project history" demo, shared ones also the others.
        </span>
      </div>

      <div
        v-for="control in segmentedControls"
        :key="control.key"
        flex="~ col gap-1"
      >
        <span
          text="xs ca"
          font="mono"
        >{{ control.label }}</span>
        <ButtonGroup
          v-model="state[control.key]"
          variant="segmented"
          :buttons="toButtons(control.options)"
          flex="wrap"
        />
      </div>

      <div flex="~ col gap-1">
        <span
          text="xs ca"
          font="mono"
        >modelValue (current)</span>
        <ButtonGroup
          v-model="state.current"
          variant="segmented"
          :buttons="currentButtons"
          flex="wrap"
        />
      </div>

      <div flex="~ col gap-1">
        <span
          text="xs ca"
          font="mono"
        >itemWidth (horizontal)</span>
        <ButtonGroup
          v-model="state.itemWidth"
          variant="segmented"
          :buttons="toButtons(['8rem', '12rem', '16rem'])"
        />
      </div>

      <div
        grid="~ cols-1 gap-1"
        p="t-1"
      >
        <Toggle
          v-for="control in toggleControls"
          :key="control.key"
          v-model="state[control.key]"
          :label="control.label"
          size="sm"
        />
      </div>

      <div flex="~ gap-2 wrap">
        <Btn
          label="‹ Prev"
          size="sm"
          outlined
          @click="historyEl?.prev()"
        />
        <Btn
          label="Next ›"
          size="sm"
          outlined
          @click="historyEl?.next()"
        />
        <Btn
          label="Reverse items"
          size="sm"
          outlined
          @click="history.reverse()"
        />
      </div>

      <span
        text="xs ca"
        font="mono"
      >
        activeIndex: {{ historyEl?.activeIndex }} / count: {{ historyEl?.count }}<br>
        last select: {{ lastSelect ?? '—' }}
      </span>
    </aside>

    <!-- Demos -->
    <main
      flex="~ col gap-6"
      min-w="0"
    >
      <!-- Project history (fully controlled) -->
      <section class="demo-card">
        <header class="demo-header">
          <h2>Project history</h2>
          <span>All controls · rich slot content · v-for</span>
        </header>

        <TimelineComposable
          ref="historyEl"
          v-model="historyModel"
          v-bind="historyProps"
          @select="lastSelect = `${$event.value} (#${$event.index})`"
        >
          <TimelineComposableItem
            v-for="item in history"
            :key="item.value"
            :value="item.value"
            :title="item.title"
            :time="item.time"
            :icon="item.icon"
            :color="state.perItemColors ? item.color : undefined"
            :status="state.forceError && item.value === 'tests' ? 'error' : undefined"
          >
            <template #default="{ side }">
              <div
                flex="~ col gap-2"
                :class="alignClass(side).items"
              >
                <div
                  flex="~ items-center gap-2 wrap"
                  :class="alignClass(side).justify"
                >
                  <span
                    class="avatar"
                    :class="item.author.color"
                  >{{ item.author.initials }}</span>
                  <span text="ca">
                    <strong
                      text="darker dark:white"
                      font="medium"
                    >{{ item.author.name }}</strong>
                    · {{ item.text }}
                  </span>
                </div>

                <div
                  v-if="item.reviewers"
                  flex="~ items-center"
                  :class="alignClass(side).justify"
                >
                  <span
                    v-for="reviewer in item.reviewers"
                    :key="reviewer.initials"
                    class="avatar"
                    :class="reviewer.color"
                    m="r--1.5"
                    ring="2 white dark:darker"
                  >{{ reviewer.initials }}</span>
                  <span
                    text="xs ca"
                    m="l-3"
                  >3 approvals</span>
                </div>

                <div
                  v-if="item.diff"
                  flex="~ items-center gap-2 wrap"
                  :class="alignClass(side).justify"
                >
                  <span
                    v-for="label in item.labels"
                    :key="label"
                    class="chip"
                  >{{ label }}</span>
                  <code
                    text="xs"
                    font="mono"
                  >
                    <span text="positive">+{{ item.diff.added }}</span>
                    <span
                      text="negative"
                      m="l-1"
                    >−{{ item.diff.removed }}</span>
                  </code>
                </div>
              </div>
            </template>
          </TimelineComposableItem>
        </TimelineComposable>
      </section>

      <!-- Roadmap (horizontal) -->
      <section class="demo-card">
        <header class="demo-header">
          <h2>Product roadmap</h2>
          <span>orientation="horizontal" · clickable · completedIcon · scrolls when overflowing</span>
        </header>

        <div
          flex="~ items-center gap-2 wrap"
          m="b-3"
        >
          <ButtonGroup
            v-model="roadmapSide"
            variant="segmented"
            :buttons="toButtons(['start', 'end', 'alternate'])"
          />
          <div flex="1" />
          <Btn
            label="‹ Prev"
            size="sm"
            outlined
            @click="roadmapEl?.prev()"
          />
          <Btn
            label="Next ›"
            size="sm"
            outlined
            @click="roadmapEl?.next()"
          />
        </div>

        <TimelineComposable
          ref="roadmapEl"
          v-model="roadmapModel"
          orientation="horizontal"
          :side="roadmapSide"
          :size="state.size"
          :line-style="state.lineStyle"
          :line-width="state.lineWidth"
          :item-width="state.itemWidth"
          :loading="state.loading"
          completed-icon="i-lucide:check"
          clickable
        >
          <TimelineComposableItem
            v-for="release in releases"
            :key="release.value"
            v-bind="release"
            :line-style="release.value >= 'v2.5' ? 'dashed' : undefined"
          />
        </TimelineComposable>

        <div
          v-if="selectedRelease"
          flex="~ items-center gap-3"
          m="t-3"
          p="3"
          border="1 ca rounded-custom"
          bg="true-gray-50 dark:true-gray-900"
        >
          <span
            :class="selectedRelease.icon"
            text="xl primary dark:sky-400"
          />
          <div flex="~ col">
            <span font="semibold">{{ selectedRelease.title }}</span>
            <span text="sm ca">{{ selectedRelease.text }}</span>
          </div>
        </div>
      </section>

      <!-- Order tracking (vertical) -->
      <section class="demo-card">
        <header class="demo-header">
          <h2>Order #10293</h2>
          <span>timePlacement="opposite" · rich slots · skeleton loading</span>
        </header>

        <div
          flex="~ items-center gap-2 wrap"
          m="b-4"
        >
          <ButtonGroup
            v-model="orderModel"
            variant="segmented"
            :buttons="order.map(step => ({ label: step.value, value: step.value }))"
          />
          <Btn
            label="Reload"
            size="sm"
            outlined
            :loading="orderLoading"
            @click="reloadOrder"
          />
        </div>

        <TimelineComposable
          v-model="orderModel"
          time-placement="opposite"
          :size="state.size"
          :line-width="state.lineWidth"
          :loading="orderLoading || state.loading"
          completed-icon="i-lucide:check"
          color="positive"
          :ui="{
            oppositeClass: ({ defaults }) => [defaults.all, 'min-w-28'],
          }"
        >
          <TimelineComposableItem
            v-for="step in order"
            :key="step.value"
            v-bind="step"
            :collapsible="step.value === 'packed'"
          >
            <template
              v-if="step.value === 'shipped'"
              #default="{ isActive }"
            >
              <div
                flex="~ col gap-2"
                p="3"
                border="1 ca rounded-custom"
                bg="true-gray-50 dark:true-gray-900"
                max-w="md"
              >
                <div flex="~ items-center gap-2">
                  <span
                    class="i-lucide:truck"
                    text="lg ca"
                  />
                  <span font="medium">DPD Express</span>
                  <span
                    v-if="isActive"
                    class="chip"
                    m="l-auto"
                  >on the way</span>
                </div>
                <div
                  flex="~ items-center gap-2"
                  text="sm ca"
                >
                  Tracking number
                  <code
                    font="mono"
                    text="darker dark:white"
                  >1Z 999 AA1 01 2345 6784</code>
                </div>
                <div flex="~ gap-2">
                  <Btn
                    label="Track package"
                    size="sm"
                  />
                  <Btn
                    label="Contact carrier"
                    size="sm"
                    outlined
                  />
                </div>
              </div>
            </template>

            <template
              v-else-if="step.value === 'packed'"
              #default
            >
              <ul
                m="0"
                p="l-4"
                text="ca"
              >
                <li>Wireless keyboard ×1</li>
                <li>USB-C hub ×1</li>
                <li>Desk mat (XL) ×1</li>
              </ul>
            </template>

            <template
              v-if="step.value === 'out'"
              #description
            >
              Courier: Tomas · <span text="positive">ETA 10:00 – 12:00</span>
            </template>
          </TimelineComposableItem>
        </TimelineComposable>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
.demo-card {
  @apply p-5 border-1 border-ca rounded-custom bg-white dark:bg-darker min-w-0;
}

.demo-header {
  @apply flex flex-col gap-0.5 m-b-4;

  h2 {
    @apply m-0 text-base font-semibold;
  }

  span {
    @apply text-xs color-ca font-mono;
  }
}

.avatar {
  @apply inline-flex flex-center shrink-0 w-6 h-6 rounded-full color-white font-rem-10 font-semibold;
}

.chip {
  @apply inline-flex items-center p-x-2 h-5 rounded-full text-xs font-medium bg-primary/10 color-primary dark:(bg-sky-400/15 color-sky-300);
}
</style>
