<script setup lang="ts" vapor>
const ready = ref(false)
const visible = ref(true)
const checkboxModel = ref<boolean | null>(false)
const checkboxItems = ref<string[]>(['alpha'])
const readonlyCheckbox = ref(false)
const toggleModel = ref<boolean | null>(false)
const stringToggleModel = ref('true')
const readonlyToggle = ref(false)
const confirmationVisible = ref(false)
const confirmationCloses = ref(0)
const marqueeVertical = ref(false)
const marqueeReverse = ref(false)
const marqueeRepeat = ref(2)
const queryBoolean = ref<boolean | string>(true)
const queryBooleanRemovals = ref(0)

const checkbox = useTemplateRef<{ focus: () => void }>('checkbox')
const toggle = useTemplateRef<{ focus: () => void }>('toggle')

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="control-primitives-example"
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
        @click="checkbox?.focus()"
      >
        Focus checkbox
      </button>
      <button
        data-example-control
        type="button"
        @click="toggle?.focus()"
      >
        Focus toggle
      </button>
    </div>

    <div
      v-if="visible"
      data-testid="control-primitives-owner"
      flex="~ col gap-4"
    >
      <div flex="~ wrap gap-2">
        <Checkbox
          ref="checkbox"
          v-model="checkboxModel"
          data-testid="state-checkbox"
          :check-value="true"
          :uncheck-value="false"
          :indeterminate-value="null"
          indeterminate
          :label="() => `Checkbox: ${String(checkboxModel)}`"
          name="state-checkbox"
        >
          <template #append>
            <span data-testid="checkbox-append">checkbox append</span>
          </template>
        </Checkbox>
        <Checkbox
          v-model="checkboxItems"
          data-testid="array-checkbox-alpha"
          check-value="alpha"
          label="Alpha"
        />
        <Checkbox
          v-model="checkboxItems"
          data-testid="array-checkbox-beta"
          check-value="beta"
          label="Beta"
        />
        <Checkbox
          v-model="readonlyCheckbox"
          data-testid="readonly-checkbox"
          label="Readonly checkbox"
          readonly
        />
      </div>
      <output
        data-example-output
        data-testid="checkbox-model"
      >{{ String(checkboxModel) }}</output>
      <output
        data-example-output
        data-testid="checkbox-array-model"
      >{{ checkboxItems.join(',') }}</output>
      <output
        data-example-output
        data-testid="readonly-checkbox-model"
      >{{ readonlyCheckbox }}</output>

      <div flex="~ wrap gap-2">
        <Toggle
          ref="toggle"
          v-model="toggleModel"
          data-testid="state-toggle"
          :check-value="true"
          :uncheck-value="false"
          :indeterminate-value="null"
          allow-indeterminate
          :label="({ state }) => `Toggle: ${state}`"
        >
          <template #prepend>
            <span data-testid="toggle-prepend">toggle prepend</span>
          </template>
          <template #bullet>
            <span data-testid="toggle-bullet">bullet</span>
          </template>
          <template #append>
            <span data-testid="toggle-append">toggle append</span>
          </template>
        </Toggle>
        <Toggle
          v-model="stringToggleModel"
          data-testid="string-toggle"
          :check-value="true"
          :uncheck-value="false"
          allow-string
          label="String toggle"
        />
        <Toggle
          v-model="readonlyToggle"
          data-testid="readonly-toggle"
          label="Readonly toggle"
          readonly
        />
      </div>
      <output
        data-example-output
        data-testid="toggle-model"
      >{{ String(toggleModel) }}</output>
      <output
        data-example-output
        data-testid="string-toggle-model"
      >{{ stringToggleModel }}</output>
      <output
        data-example-output
        data-testid="readonly-toggle-model"
      >{{ readonlyToggle }}</output>

      <QueryBuilderBooleanInput
        v-model="queryBoolean"
        data-testid="query-boolean"
        @remove:item="queryBooleanRemovals++"
      />
      <QueryBuilderMoveHandler data-testid="query-move-handler" />
      <output
        data-example-output
        data-testid="query-boolean-state"
      >{{ String(queryBoolean) }}:{{ queryBooleanRemovals }}</output>

      <div
        data-testid="confirmation-host"
        relative
        min-h="40"
      >
        <button
          data-example-control
          type="button"
          @click="confirmationVisible = true"
        >
          Open confirmation
        </button>
        <Confirmation
          v-model:visible="confirmationVisible"
          confirmation-text="Saved successfully"
          @close="confirmationCloses++"
        >
          <template #checkmark>
            <span data-testid="confirmation-checkmark">custom checkmark</span>
          </template>
          <span data-testid="confirmation-content">Custom confirmation content</span>
          <template #actions>
            <span data-testid="confirmation-actions">custom action</span>
          </template>
        </Confirmation>
      </div>
      <output
        data-example-output
        data-testid="confirmation-state"
      >{{ confirmationVisible }}:{{ confirmationCloses }}</output>

      <div flex="~ wrap gap-2">
        <button
          data-example-control
          type="button"
          @click="marqueeVertical = !marqueeVertical"
        >
          Toggle marquee vertical
        </button>
        <button
          data-example-control
          type="button"
          @click="marqueeReverse = !marqueeReverse"
        >
          Toggle marquee reverse
        </button>
        <button
          data-example-control
          type="button"
          @click="marqueeRepeat++"
        >
          Add marquee track
        </button>
      </div>
      <Marquee
        data-testid="state-marquee"
        :vertical="marqueeVertical"
        :reverse="marqueeReverse"
        :repeat="marqueeRepeat"
        duration="12s"
        gap="7px"
        pause-on-hover
      >
        <span data-testid="marquee-content">Marquee content</span>
      </Marquee>
    </div>
  </section>
</template>
