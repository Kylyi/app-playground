<script setup lang="ts" vapor>
import VaporTreeNode from './VaporTreeNode.vue'

type Node = { id: string, label: string, children?: Node[] }
const route = useRoute()
const mode = route.query.mode === 'parent' ? 'parent' : 'place'
const controls = route.query.controls === 'true'
const nodes = ref<Node[]>(controls
  ? [
      { id: 'node-1', label: 'Parent', children: [{ id: 'node-2', label: 'Child' }] },
      { id: 'node-3', label: 'Sibling' },
    ]
  : Array.from({ length: 1000 }, (_, index) => ({
      id: `node-${index + 1}`,
      label: `Node ${index + 1}`,
    })))
const selection = ref<string[]>([])
const mounted = ref(true)
const ready = ref(false)
const siblingClicks = ref(0)
const moves = ref(0)
const allowed = ref(true)
const dndConfig = computed(() => ({
  enabled: allowed.value,
  dropMode: mode,
  getParentNode: mode === 'place' ? () => null : undefined,
  onMoved: () => {
    moves.value++
  },
}))
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="tree-drag"
    :data-ready="ready"
  >
    <button
      data-example-control
      @click="mounted = !mounted"
    >
      Toggle tree
    </button>
    <button
      data-example-control
      @click="allowed = !allowed"
    >
      Toggle drag permission
    </button>
    <output
      data-example-output
      aria-label="Tree order"
      data-testid="tree-order"
    >{{ nodes.slice(0, 3).map(node => node.id).join(',') }}</output>
    <output
      data-example-output
      aria-label="Tree moves"
      data-testid="tree-moves"
    >{{ moves }}</output>
    <output
      data-example-output
      aria-label="Tree children"
      data-testid="tree-children"
    >{{ nodes.find(node => node.id === 'node-3')?.children?.map(node => node.id).join(',') }}</output>
    <Tree
      v-if="mounted"
      v-model="nodes"
      v-model:selection="selection"
      :node-el="controls ? undefined : VaporTreeNode"
      :dnd-config="controls ? { enabled: false } : dndConfig"
      :sorting-config="{ enabled: false }"
      :search-config="{ enabled: controls, includeInSearch: true }"
      :actions-config="{ enabled: controls }"
      :selection-config="{ enabled: controls, multi: true, emitKey: true }"
      :scroller-config="{ threshold: 20, rowHeight: 36 }"
      :ui="{
        containerStyle: () => ({ width: '400px', height: '240px' }),
        contentStyle: () => ({ height: '200px' }),
      }"
    />
    <output
      v-if="controls"
      data-example-output
      data-testid="tree-selection"
    >{{ selection.join(',') }}</output>
    <button
      data-example-control
      @click="siblingClicks++"
    >
      Tree sibling
    </button>
    <output
      data-example-output
      aria-label="Tree sibling clicks"
      data-testid="tree-sibling-clicks"
    >{{ siblingClicks }}</output>
  </section>
</template>
