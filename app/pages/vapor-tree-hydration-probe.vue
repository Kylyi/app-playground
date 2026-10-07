<script setup lang="ts" vapor>
import TreeHydrationChild from '../../tests/fixtures/TreeHydrationChild.vue'

const loading = ref(false)
const route = useRoute()
const provided = route.query.mode === 'provided'
const ready = ref(false)
const clicks = ref(0)
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="hydration-probe"
    :data-ready="ready"
  >
    <TreeHydrationChild v-if="!loading">
      <template #inner>
        <slot name="no-data">
          <div v-if="provided">
            Provided content
          </div>
        </slot>
        <slot name="content-inner" />
      </template>
    </TreeHydrationChild>
    <slot name="loading">
      <div v-if="loading">
        Loading
      </div>
    </slot>
    <slot name="inner" />
    <button
      data-example-control
      type="button"
      @click="clicks++"
    >
      Following sibling
    </button>
    <output data-testid="hydration-probe-clicks">
      {{ clicks }}
    </output>
  </section>
</template>
