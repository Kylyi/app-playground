<script setup lang="ts" vapor>
import { TableColumn } from '#layers/ui/app/components/Table/models/table-column.model'
import type { UILinkTarget } from '#layers/ui/app/components/Link/types/link-props.type'

const localePath = useLocalePath()
const route = useRoute()
const locale = useNuxtApp().$i18n.locale
const ready = ref(false)
const mounted = ref(true)
const alternate = ref(false)
const target = computed(() => localePath({ path: '/vapor-native-links-target', query: { item: alternate.value ? 'beta' : 'alpha' } }))
const linkRef = useTemplateRef('linkRef')
const current = computed<UILinkTarget>(() => ({ path: route.path, query: { mode: route.query.mode } }))
const namedTarget = computed(() => ({ name: `vapor-native-links-target___${unref(locale)}`, query: { item: 'named' } }))
const selection = ref(0)
const options = [{ id: 0, label: 'Zero destination' }, { id: 1, label: 'One destination' }]
const multi = ref([0])
const rows = [{ id: 1, title: 'Cell destination' }]
const columns = [new TableColumn({ field: 'title', label: 'Destination', width: '240px', link: () => target.value })]
const plainColumns = [new TableColumn({ field: 'title', label: 'Row destination', width: '240px' })]
const mixedColumns = [new TableColumn({ field: 'id', label: 'Row identity', width: '100px' }), ...columns]
const file = { id: 'link-file', name: 'link-test.txt', path: 'link-test.txt', size: 30, type: 'text/plain' }
const cardView = route.query.mode === 'card'

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="native-links"
    :data-ready="ready"
    flex="~ col gap-4"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        @click="mounted = !mounted"
      >
        Toggle link owner
      </button>
      <button
        data-example-control
        @click="alternate = !alternate"
      >
        Change link target
      </button>
      <button
        data-example-control
        @click="linkRef?.focus()"
      >
        Focus native link
      </button>
    </div>
    <div
      v-if="mounted"
      data-testid="link-owner"
      flex="~ col gap-4"
    >
      <UILink
        ref="linkRef"
        :to="target"
        data-testid="plain-link"
      >
        Plain destination
      </UILink>
      <UILink
        :to="target"
        prefetch-on="interaction"
        prefetched-class="interaction-ready"
        data-testid="interaction-link"
      >
        Prefetch on interaction
      </UILink>
      <UILink
        :to="target"
        no-prefetch
        data-testid="no-prefetch-link"
      >
        No prefetch
      </UILink>
      <UILink
        :to="current"
        data-testid="current-link"
      >
        Current page
      </UILink>
      <UILink
        :to="namedTarget"
        data-testid="named-link"
      >
        Named destination
      </UILink>
      <UILink
        :to="namedTarget"
        external
        data-testid="external-object-link"
      >
        External named destination
      </UILink>
      <UILink
        :to="target"
        replace
        data-testid="replace-link"
      >
        Replace destination
      </UILink>
      <UILink
        :to="target"
        target="_blank"
        data-testid="blank-link"
      >
        New tab destination
      </UILink>
      <UILink
        to="#link-anchor"
        data-testid="hash-link"
      >
        Jump to anchor
      </UILink>
      <UILink
        :to="target"
        disabled
        data-testid="disabled-link"
      >
        Disabled destination
      </UILink>
      <UILink
        to="javascript:alert(1)"
        external
        data-testid="unsafe-link"
      >
        Invalid destination
      </UILink>
      <UILink
        :to="target"
        data-testid="prevented-link"
        @click.prevent
      >
        Prevented destination
      </UILink>
      <UILink
        to="/link-test.txt"
        download="link-test.txt"
        data-testid="download-link"
      >
        Download fixture
      </UILink>
      <UILink
        to="/link-test.txt"
        download
        data-testid="empty-download-link"
      >
        Download with source filename
      </UILink>
      <UILink
        to="/link-test.txt"
        :download="true"
        data-testid="boolean-download-link"
      >
        Download with Boolean option
      </UILink>
      <Btn
        :to="target"
        label="Button destination"
        data-testid="button-link"
      />
      <Btn
        :to="target"
        label="Prevent button destination"
        data-testid="prevented-button-link"
        @click.prevent
      />
      <Chip
        :to="target"
        label="Chip destination"
        data-testid="chip-link"
      />
      <MiniCard
        label="Linked card"
        value="Current card destination"
        previous-value="Previous card destination"
        :to="() => target"
        :to-previous-value="target"
        data-testid="card-link"
      />
      <Selector
        v-model="selection"
        :options
        :to="() => target"
        emit-key
        readonly
        data-testid="single-selector-link"
      />
      <Selector
        v-model="multi"
        :options
        :to="() => target"
        emit-key
        multi
        readonly
        data-testid="multi-selector-link"
      />
      <FilePreview2
        :file
        download-url="/link-test.txt"
        data-testid="file-link"
      />
      <Table
        :rows
        :columns
        :features="[]"
        :breakpoint="cardView ? 9999 : 0"
        :split-rows="[]"
        :storage-key="null"
        :auto-fit="{ onInit: false }"
        :modifiers="{ useUrl: false, autoSaveSchema: false }"
        :ui="{ containerStyle: () => ({ height: '180px', width: '340px' }) }"
        data-testid="cell-link-table"
      />
      <Table
        :rows
        :columns="plainColumns"
        :features="[]"
        :breakpoint="cardView ? 9999 : 0"
        :split-rows="[]"
        :to="() => target"
        :to-link-props="{ noPrefetch: true }"
        :storage-key="null"
        :auto-fit="{ onInit: false }"
        :modifiers="{ useUrl: false, autoSaveSchema: false }"
        :ui="{ containerStyle: () => ({ height: '180px', width: '340px' }) }"
        data-testid="row-link-table"
      />
      <Table
        :rows
        :columns="mixedColumns"
        :features="[]"
        :breakpoint="cardView ? 9999 : 0"
        :split-rows="[]"
        :to="() => `${target}&source=row`"
        :to-link-props="{ noPrefetch: true }"
        :storage-key="null"
        :auto-fit="{ onInit: false }"
        :modifiers="{ useUrl: false, autoSaveSchema: false }"
        :ui="{ containerStyle: () => ({ height: '180px', width: '340px' }) }"
        data-testid="mixed-link-table"
      />
      <span id="link-anchor">Link anchor</span>
    </div>
  </section>
</template>
