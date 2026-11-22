<script setup lang="ts">
// Types
import type {
  ITimelineFeedColor,
  ITimelineFeedConnector,
  ITimelineFeedItem,
  ITimelineFeedMarker,
  ITimelineFeedSide,
  ITimelineFeedSize,
  ITimelineFeedVariant,
} from '~/components/TimelineProto/Feed/types/timeline-feed-props.type'

type IDemoItem = ITimelineFeedItem & {
  author?: string
  tags?: string[]
}

// Avatars are generated locally (initials on a color), so the demo works offline
function avatar(initials: string, bg: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${bg}"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="sans-serif" font-size="26" font-weight="600" fill="#fff">${initials}</text></svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const ITEMS: IDemoItem[] = [
  {
    id: 1,
    title: 'Project created',
    description: 'Repository initialized from the Nuxt layer template.',
    time: 'Mar 2',
    datetime: '2026-03-02',
    icon: 'i-lucide:folder-plus',
    color: 'primary',
  },
  {
    id: 2,
    title: 'Jane Cooper joined',
    description: 'Invited as a maintainer by Filip.',
    time: 'Mar 4',
    datetime: '2026-03-04',
    avatar: avatar('JC', '#7c3aed'),
    color: 'info',
  },
  {
    id: 3,
    title: 'Build failed',
    description: 'Type check failed in `Stepper.vue` ~ 3 errors.',
    time: 'Mar 9',
    datetime: '2026-03-09',
    icon: 'i-lucide:circle-x',
    color: 'negative',
  },
  {
    id: 4,
    title: 'v2.3.0 released',
    description: 'Stepper, ButtonGroup and a reworked Selector.',
    time: 'Mar 12',
    datetime: '2026-03-12',
    icon: 'i-lucide:rocket',
    color: 'positive',
    slot: 'release',
    tags: ['Stepper', 'ButtonGroup', 'Selector'],
  },
  {
    id: 5,
    title: 'Security advisory',
    description: 'A transitive dependency needs an update before the next release.',
    time: 'Mar 15',
    datetime: '2026-03-15',
    icon: 'i-lucide:shield-alert',
    color: 'warning',
  },
  {
    id: 6,
    title: 'Comment from Jane',
    time: 'Mar 18',
    datetime: '2026-03-18',
    avatar: avatar('JC', '#7c3aed'),
    color: 'info',
    slot: 'comment',
    author: 'Jane Cooper',
  },
  {
    id: 7,
    title: 'Docs migrated',
    description: 'Moved to the new docs site with live examples.',
    time: 'Mar 21',
    datetime: '2026-03-21',
    color: '#db2777',
  },
  {
    id: 8,
    title: 'v2.4.0 planned',
    description: 'Timeline, Tour and a virtualized Tree.',
    time: 'Apr',
    icon: 'i-lucide:calendar-clock',
    muted: true,
  },
]

// Controls
const side = ref<ITimelineFeedSide>('end')
const marker = ref<ITimelineFeedMarker>('auto')
const variant = ref<ITimelineFeedVariant>('filled')
const size = ref<ITimelineFeedSize>('md')
const color = ref<ITimelineFeedColor>('primary')
const connector = ref<ITimelineFeedConnector>('solid')
const connectorColor = ref<'neutral' | 'item'>('neutral')
const markerAlign = ref<'start' | 'center'>('start')
const opposite = ref(false)
const dense = ref(false)
const reverse = ref(false)
const pending = ref(true)
const itemColors = ref(true)
const slotContent = ref(true)
const showDescriptions = ref(true)

const items = computed<IDemoItem[]>(() => {
  return ITEMS.map(item => ({
    ...item,
    color: itemColors.value ? item.color : undefined,
    slot: slotContent.value ? item.slot : undefined,
    description: showDescriptions.value ? item.description : undefined,
  }))
})

const controlGroups = [
  { label: 'Side', model: side, options: ['end', 'start', 'alternate'] },
  { label: 'Marker', model: marker, options: ['auto', 'dot', 'icon', 'avatar', 'number'] },
  { label: 'Variant', model: variant, options: ['filled', 'outline', 'soft'] },
  { label: 'Size', model: size, options: ['xs', 'sm', 'md', 'lg'] },
  { label: 'Color', model: color, options: ['primary', 'secondary', 'positive', 'negative', 'warning', 'info', 'neutral'] },
  { label: 'Connector', model: connector, options: ['solid', 'dashed', 'dotted'] },
  { label: 'Connector color', model: connectorColor, options: ['neutral', 'item'] },
  { label: 'Marker align', model: markerAlign, options: ['start', 'center'] },
] as const

const toggles = [
  { label: 'Opposite (time on the other side)', model: opposite },
  { label: 'Dense', model: dense },
  { label: 'Reverse (newest first)', model: reverse },
  { label: 'Pending item', model: pending },
  { label: 'Per-item colors', model: itemColors },
  { label: 'Rich slot content', model: slotContent },
  { label: 'Descriptions', model: showDescriptions },
] as const

function toButtons(options: readonly string[]) {
  return options.map(option => ({ label: option, value: option }))
}

function reset() {
  side.value = 'end'
  marker.value = 'auto'
  variant.value = 'filled'
  size.value = 'md'
  color.value = 'primary'
  connector.value = 'solid'
  connectorColor.value = 'neutral'
  markerAlign.value = 'start'
  opposite.value = false
  dense.value = false
  reverse.value = false
  pending.value = true
  itemColors.value = true
  slotContent.value = true
  showDescriptions.value = true
}

// Usage snippet of the current configuration (non-default props only)
const snippet = computed(() => {
  const attrs = [
    side.value !== 'end' && `side="${side.value}"`,
    marker.value !== 'auto' && `marker="${marker.value}"`,
    variant.value !== 'filled' && `variant="${variant.value}"`,
    size.value !== 'md' && `size="${size.value}"`,
    color.value !== 'primary' && `color="${color.value}"`,
    connector.value !== 'solid' && `connector="${connector.value}"`,
    connectorColor.value !== 'neutral' && `connector-color="${connectorColor.value}"`,
    markerAlign.value !== 'start' && `marker-align="${markerAlign.value}"`,
    opposite.value && 'opposite',
    dense.value && 'dense',
    reverse.value && 'reverse',
    pending.value && 'pending="Waiting for review…"',
  ].filter(Boolean)

  return ['<TimelineFeed', '  :items="items"', ...attrs.map(attr => `  ${attr}`), '/>'].join('\n')
})

// Slot override examples
const DEPLOYS: ITimelineFeedItem[] = [
  { id: 'd1', title: 'Deployed to production', time: '09:41', datetime: '2026-11-22T09:41', color: 'positive', description: 'main @ 4f2c1ab' },
  { id: 'd2', title: 'Smoke tests passed', time: '09:38', datetime: '2026-11-22T09:38', color: 'positive', description: '128 / 128' },
  { id: 'd3', title: 'Rollback of v2.3.1', time: '08:02', datetime: '2026-11-22T08:02', color: 'negative', description: 'Memory leak in the Scroller' },
  { id: 'd4', title: 'Deployed to staging', time: 'Yesterday', datetime: '2026-11-21T17:15', color: 'info', description: 'release/2.3.2' },
]

const ORDER: ITimelineFeedItem[] = [
  { id: 'o1', title: 'Order placed', time: 'Mon 18. 11.', icon: 'i-lucide:shopping-cart' },
  { id: 'o2', title: 'Payment confirmed', time: 'Mon 18. 11.', icon: 'i-lucide:credit-card' },
  { id: 'o3', title: 'Shipped', time: 'Tue 19. 11.', icon: 'i-lucide:truck' },
]

const STEPS: ITimelineFeedItem[] = [
  { id: 's1', title: 'Install the layer', description: 'bun add github:gentlsro/UI#2.3' },
  { id: 's2', title: 'Extend it in nuxt.config', description: 'extends: [\'github:gentlsro/UI#2.3\']' },
  { id: 's3', title: 'Use the components', description: 'They are auto-imported.' },
]

const emojiByColor: Record<string, string> = {
  positive: '✅',
  negative: '⏪',
  info: '🚀',
}
</script>

<template>
  <div
    class="feed-page"
    grid="~ gap-6 lg:cols-[20rem_minmax(0,1fr)]"
    p="4"
    items="start"
  >
    <!-- Controls -->
    <aside
      class="g-section"
      p="4"
      gap="!4"
      lg="sticky top-4"
    >
      <div
        flex="~ items-center justify-between"
      >
        <h2
          m="0"
          text="lg"
          font="semibold"
        >
          TimelineFeed
        </h2>

        <Btn
          label="Reset"
          size="sm"
          no-uppercase
          @click="reset"
        />
      </div>

      <div
        v-for="group in controlGroups"
        :key="group.label"
        flex="~ col gap-1"
      >
        <span
          text="xs"
          font="semibold"
          color="ca"
        >
          {{ group.label }}
        </span>

        <ButtonGroup
          v-model="group.model.value"
          variant="segmented"
          :buttons="toButtons(group.options)"
          flex="wrap"
        />
      </div>

      <div flex="~ col gap-1">
        <Toggle
          v-for="toggle in toggles"
          :key="toggle.label"
          v-model="toggle.model.value"
          :label="toggle.label"
          size="sm"
        />
      </div>

      <pre
        m="0"
        p="3"
        text="xs"
        rounded="custom"
        bg="ca"
        overflow="auto"
      >{{ snippet }}</pre>
    </aside>

    <main
      flex="~ col gap-6"
      min-w="0"
    >
      <!-- Main demo -->
      <section
        class="g-section"
        p="6"
      >
        <h3
          m="0 b-4"
          text="sm"
          font="semibold"
          color="ca"
          uppercase
          tracking="wide"
        >
          Project activity
        </h3>

        <TimelineFeed
          :items
          :side
          :marker
          :variant
          :size
          :color
          :connector
          :connector-color
          :marker-align
          :opposite
          :dense
          :reverse
          :pending="pending ? 'Waiting for review…' : false"
          aria-label="Project activity"
        >
          <template #release="{ item }">
            <div
              p="3"
              rounded="custom"
              border="1 ca"
              bg="white dark:white/5"
              flex="~ col gap-2"
              max-w="sm"
              text="left"
            >
              <div flex="~ wrap gap-1">
                <span
                  v-for="tag in (item as IDemoItem).tags"
                  :key="tag"
                  p="x-2 y-0.5"
                  rounded="full"
                  text="xs"
                  bg="positive/15"
                  color="green-700 dark:green-300"
                >
                  {{ tag }}
                </span>
              </div>

              <div flex="~ gap-2">
                <Btn
                  label="Changelog"
                  size="sm"
                  outlined
                  no-uppercase
                />
                <Btn
                  label="Download"
                  size="sm"
                  no-uppercase
                />
              </div>
            </div>
          </template>

          <template #comment="{ item }">
            <blockquote
              m="0"
              p="3"
              rounded="custom"
              bg="ca"
              text="sm left"
              max-w="sm"
              border="l-3 info"
              style="border-left-style: solid"
            >
              “Love the new Stepper API — the <code>ui</code> overrides make theming trivial.”
              <footer
                m="t-1"
                text="xs"
                color="ca"
              >
                — {{ (item as IDemoItem).author }}
              </footer>
            </blockquote>
          </template>
        </TimelineFeed>
      </section>

      <!-- Slot overrides -->
      <section flex="~ col gap-3">
        <h3
          m="0"
          text="sm"
          font="semibold"
          color="ca"
          uppercase
          tracking="wide"
        >
          Slot & ui overrides
        </h3>

        <div grid="~ gap-4 md:cols-3">
          <!-- Custom marker + opposite -->
          <div
            class="g-section"
            p="4"
          >
            <span
              text="xs"
              color="ca"
            >
              <code>#marker</code> + <code>#opposite</code>, item-colored line
            </span>

            <TimelineFeed
              :items="DEPLOYS"
              opposite
              size="sm"
              variant="soft"
              connector-color="item"
              aria-label="Deployments"
            >
              <template #marker="{ item }">
                <span text="xs">{{ emojiByColor[item.color!] }}</span>
              </template>

              <template #opposite="{ item }">
                <span
                  flex="~ col"
                  text="right"
                  leading="tight"
                >
                  <span
                    text="xs"
                    font="semibold"
                    tabular-nums
                  >{{ item.time }}</span>
                  <span
                    font="rem-10"
                    color="ca"
                  >{{ item.datetime?.slice(0, 10) }}</span>
                </span>
              </template>
            </TimelineFeed>
          </div>

          <!-- ui overrides -->
          <div
            class="g-section"
            p="4"
          >
            <span
              text="xs"
              color="ca"
            >
              <code>ui</code> overrides: square markers, thick dashed line
            </span>

            <TimelineFeed
              :items="ORDER"
              variant="outline"
              color="secondary"
              connector="dashed"
              pending="Out for delivery"
              :ui="{
                markerClass: ({ defaults }) => [defaults.all, '!rounded-2'],
                connectorClass: ({ defaults }) => [defaults.all, '!border-l-3'],
                titleClass: ({ defaults }) => [defaults.all, 'uppercase tracking-wide !text-xs'],
              }"
              aria-label="Order status"
            >
              <template #time="{ item }">
                <span color="secondary dark:pink-300">{{ item.time }}</span>
              </template>
            </TimelineFeed>
          </div>

          <!-- Numbers + #description + #content -->
          <div
            class="g-section"
            p="4"
          >
            <span
              text="xs"
              color="ca"
            >
              <code>marker="number"</code> + <code>#description</code>
            </span>

            <TimelineFeed
              :items="STEPS"
              marker="number"
              variant="soft"
              size="sm"
              aria-label="Getting started"
            >
              <template #description="{ item }">
                <code
                  block
                  m="t-1"
                  p="x-2 y-1"
                  rounded="custom"
                  bg="ca"
                  text="xs"
                >{{ item.description }}</code>
              </template>
            </TimelineFeed>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
