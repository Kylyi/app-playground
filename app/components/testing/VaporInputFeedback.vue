<script setup lang="ts" vapor>
const ready = ref(false)
const visible = ref(true)
const errorsVisible = ref(false)
const customHint = ref(false)
const textValue = ref<string | undefined>('text')
const numberValue = ref<number | undefined>(12)
const areaValue = ref<string | undefined>('area')
const colorValue = ref<string | undefined>('#ff0000')
const iconValue = ref<string | undefined>('carbon:search')
const clears = reactive({ text: 0, number: 0, area: 0, color: 0, icon: 0 })

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="feedback-example"
    :data-ready="ready"
    flex="~ col gap-3"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        type="button"
        @click="errorsVisible = !errorsVisible"
      >
        Toggle errors
      </button>
      <button
        data-example-control
        type="button"
        @click="customHint = !customHint"
      >
        Toggle hint
      </button>
      <button
        data-example-control
        type="button"
        @click="visible = !visible"
      >
        Toggle owner
      </button>
    </div>
    <template v-if="visible">
      <InputHintContainer
        data-testid="hint"
        :hint="() => errorsVisible ? 'Review values' : 'Ready to edit'"
      >
        <template
          v-if="customHint"
          #default
        >
          Custom hint
        </template>
      </InputHintContainer>
      <InputErrorContainer
        data-testid="errors"
        :errors="errorsVisible ? ['First error', 'Second error'] : []"
      />
      <TextInput
        v-model="textValue"
        data-testid="clear-text"
        label="Text"
        clearable
        clear-confirmation="Clear text?"
        @clear="clears.text++"
      />
      <NumberInput
        v-model="numberValue"
        data-testid="clear-number"
        label="Number"
        clearable
        clear-confirmation="Clear number?"
        @clear="clears.number++"
      />
      <TextArea
        v-model="areaValue"
        data-testid="clear-area"
        label="Area"
        clearable
        clear-confirmation="Clear area?"
        @clear="clears.area++"
      />
      <ColorInput
        v-model="colorValue"
        data-testid="clear-color"
        label="Color"
        clearable
        clear-confirmation="Clear color?"
        @clear="clears.color++"
      />
      <IconInput
        v-model="iconValue"
        data-testid="clear-icon"
        label="Icon"
        clearable
        clear-confirmation="Clear icon?"
        @clear="clears.icon++"
      />
    </template>
    <output
      data-example-output
      data-testid="clear-counts"
    >{{ JSON.stringify(clears) }}</output>
  </section>
</template>
