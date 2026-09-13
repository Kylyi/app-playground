<script setup lang="ts" vapor>
import type { ITabProps } from '../../../packages/UI/app/components/Tabs/types/tab-props.type'

const route = useRoute()
const mode = String(route.query.mode ?? 'cached')
const model = ref<string | number>('alpha')
const message = ref('Owner context')
provide('tabs-message', message)
const ready = ref(false)
const lifecycle = ref<string[]>([])
provide('tabs-lifecycle', (name: string, event: string) => lifecycle.value.push(`${name}:${event}`))
const extra = ref(true)
const reversed = ref(false)
const renamed = ref(false)
const customNav = ref(false)
const mounted = ref(true)
const items = computed<ITabProps[]>(() => {
  const result: ITabProps[] = [
    { name: 'alpha', label: renamed.value ? 'Renamed Alpha' : 'Alpha' },
    { name: 'beta', label: 'Beta' },
    ...(extra.value ? [{ name: 'gamma', label: 'Gamma' }] : []),
  ]

  return reversed.value ? result.reverse() : result
})
const cache = mode === 'plain'
  ? undefined
  : mode === 'filtered'
    ? { include: /^Tab_/, exclude: 'Tab_beta', max: 3 }
    : { max: 2 }
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="tabs-example"
    :data-ready="ready"
    flex="~ col gap-4"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        type="button"
        @click="message = 'Updated owner context'"
      >
        Update context
      </button>
      <button
        data-example-control
        type="button"
        @click="extra = !extra"
      >
        Toggle Gamma
      </button>
      <button
        data-example-control
        type="button"
        @click="reversed = !reversed"
      >
        Reverse tabs
      </button>
      <button
        data-example-control
        type="button"
        @click="renamed = !renamed"
      >
        Rename Alpha
      </button>
      <button
        data-example-control
        type="button"
        @click="customNav = !customNav"
      >
        Toggle custom navigation
      </button>
      <button
        data-example-control
        type="button"
        @click="mounted = !mounted"
      >
        Toggle tabs owner
      </button>
    </div>
    <output
      data-example-output
      aria-label="Active tab"
      data-testid="active-tab"
    >{{ model }}</output>
    <output
      data-example-output
      aria-label="Tab lifecycle"
      data-testid="tab-lifecycle"
    >{{ JSON.stringify(lifecycle) }}</output>
    <Tabs
      v-if="mounted"
      v-model="model"
      :keep-alive-props="cache"
      :ui="{ tabStyle: () => ({ padding: '13px' }) }"
    >
      <template
        v-if="customNav"
        #navigation="{ tabs }"
      >
        <nav
          data-testid="custom-tabs"
          flex="~ gap-2"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            data-example-control
            type="button"
            @click="model = tab.name"
          >
            Custom {{ tab.name }}
          </button>
        </nav>
      </template>
      <Tab
        v-for="item in items"
        v-slot="{ tab }"
        :key="item.name"
        v-bind="item"
      >
        <VaporTabContent :name="tab.name" />
      </Tab>
    </Tabs>
  </section>
</template>
