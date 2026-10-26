<script setup lang="ts" vapor>
import type { ComponentExposed } from 'vue-component-type-helpers'
import type { IComponent } from '#layers/utilities/app/types/component-map.type'
import TextInput from '#layers/ui/app/components/Inputs/TextInput/TextInput.vue'
import { createComponent } from '#layers/ui/app/utils/create-component'
import ConsumerContractRow from './ConsumerContractRow.vue'
import ConsumerCallable from './ConsumerCallable.vue'
import type List from '#layers/ui/app/components/List/List.vue'

const route = useRoute()
const mode = route.query.mode ?? 'imported'
const seed = typeof route.query.seed === 'string' ? route.query.seed : 'Initial consumer value'
const value = ref(seed)
const updates = ref(0)
const visible = ref(true)
const transitionVisible = ref(true)
const ready = ref(false)
const validationQueue = useValidationQueue()
const queuedProcesses = computed(() => ready.value ? validationQueue.value.consumerRows?.length ?? 0 : 0)
const editor = useTemplateRef<ComponentExposed<typeof TextInput>>('editor')
const selected = ref<string>()
const rows = [{ id: 0, label: 'Consumer zero' }, { id: 1, label: 'Consumer one' }]
const asynchronous = mode === 'async'
const search = ref('Initial')
const searchRevision = ref(0)
const searchCalls = ref(0)
const searchErrors = ref(0)
const list = useTemplateRef<ComponentExposed<typeof List>>('list')
const retainedItems = shallowRef<() => IItem[]>(() => [])
const requests: {
  search: string | undefined
  resolve: (rows: IItem[]) => void
  reject: (error: unknown) => void
}[] = []
const searchConfig = asynchronous
  ? { enabled: true, fnc: (search: string | undefined) => new Promise<IItem[]>((resolve, reject) => {
      requests.push({ search, resolve, reject })
      searchCalls.value++
    }) }
  : { enabled: false }

function toggleConsumer() {
  if (visible.value && list.value) {
    retainedItems.value = list.value.getListItems
  }
  visible.value = !visible.value
}

function finishSearch(oldest = false, reject = false) {
  const request = oldest ? requests.shift() : requests.pop()
  if (reject) {
    request?.reject(new Error('Consumer search failed'))
  } else {
    request?.resolve([{ id: 0, label: `Result ${request.search}` }])
  }
}
const descriptor: IComponent<typeof TextInput> = {
  component: markRaw(TextInput),
  props: { placeholder: 'Consumer editor', clearable: false, hasCopyBtn: false, layout: 'regular' },
  icon: 'lucide:pencil',
}
const component = createComponent<typeof TextInput>({
  ...descriptor,
  component: mode === 'registered' ? 'TextInput' : mode === 'resolver' ? () => TextInput : descriptor.component,
})
// A template-only SFC compiles to a callable native component in the client.
const callable = createComponent({ component: ConsumerCallable })

function updateValue(next: string | null | undefined) {
  value.value = next ?? ''
  updates.value++
}

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="consumer-contracts"
    :data-ready="ready"
    flex="~ col gap-3"
  >
    <div flex="~ gap-2 wrap">
      <button
        data-example-control
        @click="toggleConsumer"
      >
        Toggle consumer
      </button>
      <button
        data-example-control
        @click="editor?.focus()"
      >
        Focus consumer editor
      </button>
      <button
        data-example-control
        @click="value = 'Parent replacement'"
      >
        Replace consumer value
      </button>
      <button
        data-example-control
        @click="transitionVisible = !transitionVisible"
      >
        Toggle callable component
      </button>
      <button
        data-example-control
        @click="validationQueue.consumerRows?.forEach(([process]) => process())"
      >
        Run consumer validation queue
      </button>
    </div>
    <div
      v-if="asynchronous"
      flex="~ wrap gap-2"
    >
      <button
        data-example-control
        @click="search = `Newest ${++searchRevision}`"
      >
        Request newer list search
      </button>
      <button
        data-example-control
        @click="finishSearch()"
      >
        Resolve latest list search
      </button>
      <button
        data-example-control
        @click="finishSearch(true)"
      >
        Resolve oldest list search
      </button>
      <button
        data-example-control
        @click="finishSearch(false, true)"
      >
        Reject latest list search
      </button>
      <output
        data-example-output
        data-testid="list-search-calls"
      >{{ searchCalls }}</output>
      <output
        data-example-output
        data-testid="list-search-errors"
      >{{ searchErrors }}</output>
      <output
        data-example-output
        data-testid="retained-list-items"
      >{{ retainedItems().map(row => row.label).join('|') }}</output>
    </div>
    <div
      v-if="visible"
      data-testid="consumer-owner"
    >
      <Component
        :is="component?.component"
        ref="editor"
        v-bind="component?.props"
        :model-value="value"
        @update:model-value="updateValue"
      >
        <template #append="{ clear }">
          <button
            data-example-control
            @click="clear"
          >
            Clear consumer editor
          </button>
        </template>
      </Component>
      <List
        ref="list"
        v-model:search="search"
        :items="rows"
        :row-component="ConsumerContractRow"
        :search-config
        :sorting-config="{ enabled: false }"
        :scroller-config="{ threshold: 10 }"
        @error:search="searchErrors++"
      >
        <template #item="{ row }">
          <button
            data-example-control
            @click.stop="selected = row.label"
          >
            {{ row.label }}
          </button>
        </template>
        <template #search-error="{ error }">
          <span
            role="alert"
            data-testid="consumer-search-error"
          >{{ error instanceof Error ? error.message : String(error) }}</span>
        </template>
      </List>
    </div>
    <Component
      :is="callable?.component"
      v-if="transitionVisible"
    />
    <output
      data-example-output
      data-testid="consumer-value"
    >{{ value }}</output>
    <output
      data-example-output
      data-testid="consumer-updates"
    >{{ updates }}</output>
    <output
      data-example-output
      data-testid="consumer-selection"
    >{{ selected ?? 'empty' }}</output>
    <output
      data-example-output
      data-testid="consumer-queue-size"
    >{{ queuedProcesses }}</output>
  </section>
</template>
