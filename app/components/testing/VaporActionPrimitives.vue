<script setup lang="ts" vapor>
const ready = ref(false)
const visible = ref(true)
const drawerOpen = ref(true)
const showLayoutMeta = ref(true)
const saves = ref(0)
const archives = ref(0)
const deletes = ref(0)
const editing = ref(false)
const confirmationModel = ref(false)
const confirmationCleanups = ref(0)
const groupSaves = ref(0)
const groupDeletes = ref(0)
const groupRestores = ref(0)
const drawerPanelOpen = ref(true)
const pageDrawerOpen = ref(true)
const pageDrawerMini = ref(false)
const pageLoading = ref(false)
const tableOptionsOpen = ref(false)
const draggableItems = ref([
  { id: 'first', label: 'First draggable' },
  { id: 'second', label: 'Second draggable' },
])

const transientConfirmation = useTemplateRef<{
  showTemporarily: (onCleanup?: () => void) => void
}>('transientConfirmation')

const draggableItem = {
  id: 'action-item',
  label: 'Draggable action',
}

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="action-primitives-example"
    :data-ready="ready"
    flex="~ col gap-4"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        type="button"
        @click="visible = !visible"
      >
        Toggle owner
      </button>
      <button
        data-example-control
        type="button"
        @click="showLayoutMeta = !showLayoutMeta"
      >
        Toggle layout meta
      </button>
      <button
        data-example-control
        type="button"
        @click="drawerPanelOpen = true"
      >
        Open drawer panel
      </button>
      <button
        data-example-control
        type="button"
        @click="pageLoading = !pageLoading"
      >
        Toggle page loading
      </button>
      <button
        data-example-control
        type="button"
        @click="tableOptionsOpen = true"
      >
        Open table options
      </button>
    </div>

    <output
      data-example-output
      data-testid="confirmation-cleanups"
    >{{ confirmationCleanups }}</output>

    <div
      v-if="visible"
      data-testid="action-primitives-owner"
      flex="~ col gap-4"
    >
      <Drawer
        v-model="drawerPanelOpen"
        absolute
        title="Drawer panel"
        data-testid="action-drawer-panel"
      >
        <span data-testid="action-drawer-panel-content">Drawer content</span>
      </Drawer>

      <DraggableContainer
        v-model:items="draggableItems"
        data-testid="action-draggable-container"
      >
        <template #default="{ item, idx }">
          <span :data-testid="`draggable-container-item-${idx}`">{{ item.label }}</span>
        </template>
      </DraggableContainer>

      <div
        relative
        data-testid="action-page-shell"
      >
        <PageDrawer
          v-model="pageDrawerOpen"
          v-model:mini="pageDrawerMini"
          side="left"
          :width="160"
          :mini-width="48"
          data-testid="action-page-drawer"
        >
          <span data-testid="action-page-drawer-content">Page drawer content</span>
        </PageDrawer>
        <PageWrapper
          :loading="pageLoading"
          :page-title-props="{ title: 'Wrapped page' }"
          data-testid="action-page-wrapper"
        >
          <span data-testid="action-page-content">Wrapped content</span>
        </PageWrapper>
      </div>

      <ChipArchived data-testid="action-archived-chip" />

      <div flex="~ wrap gap-2">
        <CrudBtnAdd label="Add record" />
        <CrudBtnSave
          label="Save record"
          @save="saves++"
        />
        <CrudBtnArchive
          label="Archive record"
          @archive="archives++"
        >
          <template #confirmation>
            Archive this record?
          </template>
        </CrudBtnArchive>
        <CrudBtnDelete
          label="Delete record"
          @delete="deletes++"
        />
        <CrudBtnDelete
          label="Delete directly"
          no-confirm
          @delete="deletes++"
        />
      </div>
      <output
        data-example-output
        data-testid="action-counts"
      >{{ saves }}:{{ archives }}:{{ deletes }}</output>

      <div
        relative
        data-testid="transient-confirmation-owner"
      >
        <button
          data-example-control
          type="button"
          @click="transientConfirmation?.showTemporarily(() => confirmationCleanups++)"
        >
          Show transient confirmation
        </button>
        <BtnConfirmation
          ref="transientConfirmation"
          v-model="confirmationModel"
          label="Saved temporarily"
          position="right"
        />
        <output
          data-example-output
          data-testid="transient-confirmation-model"
        >{{ confirmationModel }}</output>
      </div>

      <CopyBtn
        data-testid="action-copy"
        :model-value="{ id: 7, label: 'copy-me' }"
        label="Copy record"
      />

      <Form
        v-model:is-editing="editing"
        data-testid="edit-controls"
        label="Save editing"
        :edit-controls="{ cancel: true, edit: true }"
      >
        Editing controls
        <output
          data-example-output
          data-testid="editing-model"
        >{{ editing }}</output>
      </Form>

      <CrudBtns
        data-testid="crud-group"
        labels
        :actions="{ save: true, delete: true, archive: true }"
        @save="groupSaves++"
        @delete="groupDeletes++"
      >
        <template #prepend="{ loaderType, labels }">
          <span data-testid="crud-group-prepend">{{ loaderType }}:{{ labels }}</span>
        </template>
        <template #delete-confirmation>
          Delete from grouped actions?
        </template>
        <template #append="{ loaderType, labels }">
          <span data-testid="crud-group-append">{{ loaderType }}:{{ labels }}</span>
        </template>
      </CrudBtns>
      <CrudBtns
        data-testid="crud-restore-group"
        labels
        :actions="{ restore: true }"
        @restore="groupRestores++"
      />
      <output
        data-example-output
        data-testid="crud-group-counts"
      >{{ groupSaves }}:{{ groupDeletes }}:{{ groupRestores }}</output>

      <DrawerTitle
        v-model="drawerOpen"
        title="Action drawer"
        data-testid="action-drawer-title"
      >
        <template #left>
          <span data-testid="action-drawer-left">left</span>
        </template>
        <template #right>
          <span data-testid="action-drawer-right">right</span>
        </template>
      </DrawerTitle>
      <output
        data-example-output
        data-testid="action-drawer-open"
      >{{ drawerOpen }}</output>

      <DraggableItem
        :item="draggableItem"
        tag="button"
        type="button"
        data-testid="action-draggable"
      >
        Draggable action
      </DraggableItem>

      <QueryBuilderItemDataTypeShortcut
        data-type="string"
        data-testid="action-data-type"
      />

      <TableLayoutMeta
        :has-select="showLayoutMeta"
        :has-filters="showLayoutMeta"
        :has-sorting="showLayoutMeta"
        is-public
        is-default
        data-testid="action-layout-meta"
      />

      <TableOptionsDialog v-model="tableOptionsOpen" />
    </div>
  </section>
</template>
