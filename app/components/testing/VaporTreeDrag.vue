<script setup lang="ts" vapor>
import VaporTreeNode from './VaporTreeNode.vue'
import type { ITreeProps } from '#layers/ui/app/components/Tree/types/tree-props.type'

type Node = { id: string | number, label: string, children?: Node[] }
const route = useRoute()
const mode: 'parent' | 'place' = route.query.mode === 'parent' ? 'parent' : 'place'
const restricted = route.query.mode === 'restricted'
const controls = route.query.controls === 'true'
const numericIds = route.query.ids === 'numeric'
const external = route.query.external === 'true'
const outsideEvents = ref<{ phase: string, id: string | number, x: number, y: number }[]>([])
const nodes = ref<Node[]>(controls
  ? [
      { id: 'node-1', label: 'Parent', children: [{ id: 'node-2', label: 'Child' }] },
      { id: 'node-3', label: 'Sibling' },
    ]
  : Array.from({ length: 1000 }, (_, index) => ({
      id: numericIds ? index : `node-${index + 1}`,
      label: `Node ${index + 1}`,
    })))
const selection = ref<(string | number)[]>([])
const mounted = ref(true)
const ready = ref(false)
const siblingClicks = ref(0)
const moves = ref(0)
const allowed = ref(true)
const dndConfig = computed<ITreeProps<Node>['dndConfig']>(() => ({
  enabled: allowed.value,
  dropMode: mode,
  getParentNode: mode === 'place' ? () => null : undefined,
  canBeDragged: ({ node }) => !restricted || node.id !== 'node-1',
  canBeDropped: ({ targetNode, placement }) => !restricted || targetNode?.id !== 'node-3' || placement !== 'below',
  onMoved: () => {
    moves.value++
  },
  onDragOutside: external
    ? ({ phase, draggedNode, x, y }) => outsideEvents.value.push({ phase, id: draggedNode.id, x, y })
    : undefined,
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
    >{{ nodes.find(node => node.id === (numericIds ? 0 : 'node-3'))?.children?.map(node => node.id).join(',') }}</output>
    <Tree
      v-if="mounted"
      v-model="nodes"
      v-model:selection="selection"
      :node-el="controls ? undefined : VaporTreeNode"
      :dnd-config="controls ? { enabled: false } : dndConfig"
      :sorting-config="{ enabled: false }"
      :search-config="{ enabled: controls, includeInSearch: true, keepParents: true }"
      :actions-config="{ enabled: controls }"
      :selection-config="{ enabled: controls, multi: true, emitKey: true }"
      :scroller-config="{ rowHeight: 36 }"
      :ui="{
        containerStyle: () => ({ width: '400px', height: '240px' }),
        contentStyle: () => ({ height: '200px' }),
      }"
    />
    <template v-if="external">
      <div
        data-testid="external-tree-target"
        :style="{ width: '400px', height: '100px' }"
      >
        External canvas
      </div>
      <output
        data-example-output
        data-testid="tree-outside-events"
      >{{ JSON.stringify(outsideEvents) }}</output>
    </template>
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
