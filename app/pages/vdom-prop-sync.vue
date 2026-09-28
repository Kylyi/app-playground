<script setup lang="ts">
import type { IQueryBuilderRow } from '../../packages/UI/app/components/QueryBuilder/types/query-builder-row-props.type'

const revision = ref(0)
// Mount on demand to isolate prop updates from the separate hydration regressions.
const mounted = ref(false)
const ready = ref(false)
const queryItems = ref<IQueryBuilderRow[]>([])
const inlineItems = ref<IQueryBuilderRow[]>([])
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="prop-sync"
    :data-ready="ready"
  >
    <button
      data-example-control
      @click="revision++"
    >
      Update parent
    </button>
    <button
      data-example-control
      @click="mounted = !mounted"
    >
      Toggle components
    </button>
    <output data-testid="revision">{{ revision }}</output>
    <!-- Deliberately pass fresh objects from a VDOM render to Vapor children. -->
    <div
      v-if="mounted"
      :data-revision="revision"
      data-testid="sync-children"
    >
      <List
        :items="[]"
        :search-config="{ enabled: !!(revision % 2) }"
        :sorting-config="{ enabled: false }"
      />
      <Tree
        :nodes="[]"
        :search-config="{ enabled: !!(revision % 2) }"
        :selection-config="{ enabled: true }"
      />
      <TreeDms
        :model-value="[]"
        :modifiers="{}"
        :context-menu-config="{ enabled: !!(revision % 2) }"
      />
      <QueryBuilder
        v-model:items="queryItems"
        :columns="[]"
      />
      <QueryBuilderInline
        v-model:items="inlineItems"
        :columns="[]"
      />
      <Table
        :rows="[]"
        :columns="[]"
        :features="[]"
        :storage-key="null"
        :pagination-config="{ enabled: true, pageSize: revision % 2 ? 25 : 10 }"
        :modifiers="{ useUrl: false, autoSaveSchema: false }"
        :auto-fit="{ onInit: false }"
      />
      <Pivot
        :data="[]"
        :items="[]"
        :collapse-config="{}"
        :performance="{}"
      />
    </div>
  </section>
</template>
