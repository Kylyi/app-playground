<script setup lang="ts" vapor>
import type { ISearchInputExpose } from '#layers/ui/app/components/Inputs/TextInput/types/search-input-expose.type'

const ready = ref(false)
const model = ref<string | null>('Alpha')
const slotsVisible = ref(false)
const visible = ref(true)
const updateCount = ref(0)
const clearCount = ref(0)
const enterCount = ref(0)
const input = ref<ISearchInputExpose>()

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="search-input-example"
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
        @click="model = 'Parent value'"
      >
        Replace model
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
        @mousedown.prevent
        @click="input?.blur()"
      >
        Blur input
      </button>
      <button
        data-example-control
        type="button"
        @click="input?.clear(false)"
      >
        Clear input
      </button>
      <button
        data-example-control
        type="button"
        @click="visible = !visible"
      >
        Toggle input owner
      </button>
    </div>
    <div data-testid="search-input-field">
      <SearchInput
        v-if="visible"
        ref="input"
        v-model="model"
        :has-copy-btn="false"
        layout="regular"
        placeholder="Search value"
        tooltip="Default search help"
        :tooltip-props="{ noTransition: true }"
        @update:model-value="updateCount++"
        @clear="clearCount++"
        @enter="enterCount++"
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
            @click="clear(false)"
          >
            Slot clear
          </button>
        </template>
        <template
          v-if="slotsVisible"
          #tooltip
        >
          Custom search help
        </template>
      </SearchInput>
    </div>
    <output
      data-example-output
      data-testid="search-value"
    >{{ model ?? 'empty' }}</output>
    <output
      data-example-output
      data-testid="search-updates"
    >{{ updateCount }}</output>
    <output
      data-example-output
      data-testid="search-clears"
    >{{ clearCount }}</output>
    <output
      data-example-output
      data-testid="search-enters"
    >{{ enterCount }}</output>
  </section>
</template>
