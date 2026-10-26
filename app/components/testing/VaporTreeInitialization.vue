<script setup lang="ts" vapor>
import type { ITreeNode } from '#layers/ui/app/components/Tree/types/tree-node.type'
import type { ITreeProps } from '#layers/ui/app/components/Tree/types/tree-props.type'

type Node = { id: string | number, label: string, children?: Node[] }
type PendingSearch = {
  id: number
  query: string
  resolve: () => void
  reject: () => void
}

const mode = useRoute().query.mode ?? 'sorted'
const nodes = ref<Node[]>(mode === 'empty'
  ? []
  : mode === 'zero'
    ? [
        { id: 0, label: 'Match zero parent', children: [{ id: 1, label: 'Match zero child' }] },
        { id: 2, label: 'Other root' },
      ]
    : [
        { id: 'b', label: 'Beta', children: [
          { id: 'b-other', label: 'Zulu' },
          { id: 'b-match', label: 'Match B' },
        ] },
        { id: 'a', label: 'Alpha', children: [
          { id: 'a-other', label: 'Other A' },
          { id: 'a-match', label: 'Match A' },
        ] },
      ])
const search = ref(mode === 'sorted' || mode === 'known-leaves' || mode === 'empty' ? '' : 'Match')
const mounted = ref(true)
const ready = ref(false)
const pending = shallowRef<PendingSearch[]>([])
const searchErrors = ref(0)
const customErrorSlot = ref(true)
const collapseConfig: ITreeProps<Node>['collapseConfig'] = {
  expandedLevelOnInit: 2,
  hasChildrenFnc: mode === 'known-leaves' ? node => !!node.children?.length : undefined,
}
let requestId = 0

function customSearch(query: string | undefined, source: ITreeNode<Node>[]) {
  const result = source.filter(node => node.ref.label.includes(query ?? ''))
  if (mode !== 'async' && mode !== 'failed') {
    return result
  }

  // SSR resolves immediately; the initial loading view must still match the
  // client's unresolved promise. Browser controls resolve requests out of order.
  if (import.meta.server) {
    return mode === 'failed' ? Promise.reject(new Error('Custom search unavailable')) : Promise.resolve(result)
  }

  return new Promise<ITreeNode<Node>[]>((resolve, reject) => {
    pending.value = [...pending.value, {
      id: ++requestId,
      query: query ?? '',
      resolve: () => resolve(result),
      reject: () => reject(new Error('Custom search unavailable')),
    }]
  })
}

const searchConfig: ITreeProps<Node>['searchConfig'] = {
  enabled: true,
  keepParents: mode !== 'zero',
  includeInSearch: mode === 'zero'
    ? ({ item, children, parent }) => item.id === 0
        ? children.some(child => child.id === 1)
        : parent?.id === 0
    : undefined,
  fnc: mode === 'custom' || mode === 'async' || mode === 'failed' ? customSearch : undefined,
}

function resolveSearch(newest: boolean) {
  const request = newest ? pending.value.at(-1) : pending.value[0]
  if (request) {
    pending.value = pending.value.filter(item => item !== request)
    request.resolve()
  }
}

function rejectSearch() {
  const request = pending.value.at(-1)
  if (request) {
    pending.value = pending.value.filter(item => item !== request)
    request.reject()
  }
}

function toggleLeafChildren() {
  nodes.value = nodes.value.map(parent => parent.id === 'a'
    ? { ...parent, children: parent.children?.map(node => node.id === 'a-match'
        ? { ...node, children: node.children?.length ? [] : [{ id: 'a-nested', label: 'Nested match' }] }
        : node) }
    : parent)
}

function renameMatchedNode() {
  const node = nodes.value.find(parent => parent.id === 'a')?.children?.find(child => child.id === 'a-match')
  if (node) {
    node.label = node.label === 'Match A' ? 'Match renamed A' : 'Match A'
    // Labels/search are derived when the model changes. Publish the edited
    // array while retaining the source item references.
    nodes.value = [...nodes.value]
  }
}

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="tree-initialization"
    :data-ready="ready"
  >
    <button
      data-example-control
      @click="mounted = !mounted"
    >
      Toggle initialized tree
    </button>
    <button
      v-if="mode === 'known-leaves'"
      data-example-control
      @click="toggleLeafChildren"
    >
      Toggle leaf children
    </button>
    <button
      data-example-control
      @click="search = 'Other'"
    >
      Search Other
    </button>
    <button
      data-example-control
      @click="search = 'Missing'"
    >
      Search Missing
    </button>
    <button
      data-example-control
      @click="search = 'Match'"
    >
      Search Match
    </button>
    <button
      v-if="mode === 'filtered' || mode === 'custom'"
      data-example-control
      @click="renameMatchedNode"
    >
      Rename matched source node
    </button>
    <template v-if="mode === 'async' || mode === 'failed'">
      <button
        data-example-control
        @click="customErrorSlot = !customErrorSlot"
      >
        Toggle error slot
      </button>
      <button
        data-example-control
        @click="rejectSearch"
      >
        Reject newest search
      </button>
      <button
        data-example-control
        @click="resolveSearch(true)"
      >
        Resolve newest search
      </button>
      <button
        data-example-control
        @click="resolveSearch(false)"
      >
        Resolve oldest search
      </button>
      <output
        data-example-output
        data-testid="tree-pending-searches"
      >
        {{ pending.map(item => item.query).join(',') }}
      </output>
    </template>
    <Tree
      v-if="mounted"
      v-model="nodes"
      :search
      :search-config
      :sorting-config="{ enabled: true, sortBy: [{ name: 'label', field: 'label', sort: 'asc' }] }"
      :collapse-config
      :dnd-config="{ enabled: false }"
      :scroller-config="{ rowHeight: 36 }"
      :ui="{ containerStyle: () => ({ width: '400px', maxWidth: '100%', height: '320px' }) }"
      @error:search="searchErrors++"
    >
      <template #loading="{ loading }">
        <p
          v-if="loading"
          data-testid="tree-initial-pending"
          role="status"
        >
          Waiting for custom search
        </p>
      </template>
      <template #no-data>
        <p
          data-testid="tree-initial-empty"
        >
          Empty tree
        </p>
      </template>
      <template
        v-if="customErrorSlot"
        #search-error="{ error }"
      >
        <p
          role="alert"
          data-testid="tree-search-error"
        >
          {{ error instanceof Error ? error.message : String(error) }}
        </p>
      </template>
    </Tree>
    <output
      data-example-output
      data-testid="tree-search-errors"
    >{{ searchErrors }}</output>
    <output
      data-example-output
      data-testid="tree-source-order"
    >
      {{ nodes.map(node => node.id).join(',') }}
    </output>
  </section>
</template>
