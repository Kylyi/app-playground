<script setup lang="ts" vapor>
import { handleItemDrop } from '#layers/ui/app/components/TreeDms/functions/handle-item-drop'
import type { ITreeDmsProps } from '#layers/ui/app/components/TreeDms/types/tree-dms-props.type'
import type { ITreeNode } from '#layers/ui/app/components/Tree/types/tree-node.type'

type DmsItem = { id: string, name: string, type: string, children: DmsItem[], file?: File }
const visible = ref(true)
const ready = ref(false)
const items = ref<DmsItem[]>([{ id: 'folder', name: 'Documents', type: 'folder', children: [] }])
const delayed = ref(false)
const started = ref(0)
const completed = ref(0)
const resolveDrop = shallowRef<() => void>()
const dms = useTemplateRef<{
  getStore: () => { nodeEditing: Ref<ITreeNode<DmsItem> | undefined> }
  getTreeStore: () => { nodeById: Ref<Record<string, ITreeNode<DmsItem>>> }
}>('dms')
async function renameItem({ item }: { item: DmsItem }) {
  started.value++
  if (delayed.value) {
    await new Promise<void>(resolve => resolveDrop.value = resolve)
  }
  completed.value++

  return item
}
function renameFolder() {
  if (dms.value) {
    dms.value.getStore().nodeEditing.value = dms.value.getTreeStore().nodeById.value.folder
  }
}
const dropFile: NonNullable<NonNullable<ITreeDmsProps<DmsItem>['dropZoneConfig']>['fnc']> = async payload => {
  started.value++
  if (delayed.value) {
    await new Promise<void>(resolve => resolveDrop.value = resolve)
  }
  const result = handleItemDrop<DmsItem>(payload)
  completed.value++

  return result
}
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="tree-dms-drop"
    :data-ready="ready"
  >
    <button
      data-example-control
      @click="visible = !visible"
    >
      Toggle DMS
    </button>
    <button
      data-example-control
      @click="delayed = !delayed"
    >
      Toggle delayed drop
    </button>
    <button
      data-example-control
      @click="resolveDrop?.()"
    >
      Complete drop
    </button>
    <button
      data-example-control
      @click="renameFolder"
    >
      Rename folder
    </button>
    <output
      data-example-output
      data-testid="drop-progress"
    >{{ started }} / {{ completed }}</output>
    <p>Přetáhni soubor do složky Documents nebo na prázdnou plochu stromu.</p>
    <output
      data-example-output
      aria-label="Dms items"
      data-testid="dms-items"
    >{{ JSON.stringify(items) }}</output>
    <TreeDms
      v-if="visible"
      ref="dms"
      v-model="items"
      file-key="file"
      folder-key="folder"
      :tree-props="{
        labelKey: 'name',
        dndConfig: { enabled: true, dropMode: 'parent' },
        searchConfig: { enabled: false },
        sortingConfig: { enabled: false },
        ui: { containerStyle: () => ({ width: '400px', height: '300px' }) },
      }"
      :drop-zone-config="{ enabled: true, fnc: dropFile }"
      :modifiers="{ onItemRename: renameItem }"
    />
  </section>
</template>
