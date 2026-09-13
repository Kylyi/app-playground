<script setup lang="ts" vapor>
const ready = ref(false)
const model = ref<string | number | null>('Alpha')
const dataType = ref<'string' | 'number'>('string')
const slotsVisible = ref(false)
const visible = ref(true)
const input = ref<{ focus: () => void, select: () => void }>()

function changeType() {
  dataType.value = dataType.value === 'string' ? 'number' : 'string'
  model.value = dataType.value === 'number' ? 42 : 'Alpha'
}

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="dynamic-input-example"
    :data-ready="ready"
    flex="~ col gap-3"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        type="button"
        @click="slotsVisible = !slotsVisible"
      >
        Toggle slots
      </button>
      <button
        data-example-control
        type="button"
        @click="changeType"
      >
        Change input type
      </button>
      <button
        data-example-control
        type="button"
        @click="input?.focus()"
      >
        Focus input
      </button>
      <button
        data-example-control
        type="button"
        @click="input?.select()"
      >
        Select input
      </button>
      <button
        data-example-control
        type="button"
        @click="visible = !visible"
      >
        Toggle input owner
      </button>
    </div>
    <div data-testid="dynamic-input-field">
      <DynamicInput
        v-if="visible"
        ref="input"
        v-model="model"
        :data-type
        :clearable="false"
        :step="0"
        :has-copy-btn="false"
        layout="regular"
        placeholder="Dynamic value"
      >
        <template
          v-if="slotsVisible"
          #prepend="{ focus }"
        >
          <button
            data-example-control
            type="button"
            @click="focus"
          >
            Slot focus
          </button>
        </template>
        <template
          v-if="slotsVisible"
          #append="{ clear }"
        >
          <button
            data-example-control
            type="button"
            @click="clear"
          >
            Slot clear
          </button>
        </template>
      </DynamicInput>
    </div>
    <output
      data-example-output
      aria-label="Dynamic input value"
      data-testid="dynamic-input-value"
    >{{ model ?? 'empty' }}</output>
  </section>
</template>
