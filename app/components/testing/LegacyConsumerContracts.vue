<script setup lang="ts">
import LegacyContractModel from './LegacyContractModel.vue'

const model = ref<string | null>('Controlled legacy value')
const updates = ref(0)
const visible = ref(true)
const ready = ref(false)
const origin = ref({ label: 'Origin value' })
const resetUpdates = ref(0)
const { model: draft, syncToParent, syncFromParent } = useRefReset(origin, {
  onSyncToOrigin: () => resetUpdates.value++,
})
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="legacy-consumer-contracts"
    :data-ready="ready"
    flex="~ col gap-3"
  >
    <button
      data-example-control
      @click="visible = !visible"
    >
      Toggle legacy consumer
    </button>
    <button
      data-example-control
      @click="model = 'Legacy parent replacement'"
    >
      Replace legacy value
    </button>
    <div
      v-if="visible"
      data-testid="legacy-controlled"
    >
      <LegacyContractModel
        v-model="model"
        @update:model-value="updates++"
      />
    </div>
    <div
      v-if="visible"
      data-testid="legacy-local"
    >
      <LegacyContractModel />
    </div>
    <output
      data-example-output
      data-testid="legacy-value"
    >{{ model }}</output>
    <output
      data-example-output
      data-testid="legacy-updates"
    >{{ updates }}</output>
    <input
      v-model="draft.label"
      aria-label="Reset draft"
    >
    <button
      data-example-control
      @click="syncToParent()"
    >
      Commit reset draft
    </button>
    <button
      data-example-control
      @click="syncFromParent()"
    >
      Restore reset draft
    </button>
    <output
      data-example-output
      data-testid="reset-origin"
    >{{ origin.label }}</output>
    <output
      data-example-output
      data-testid="reset-updates"
    >{{ resetUpdates }}</output>
  </section>
</template>
