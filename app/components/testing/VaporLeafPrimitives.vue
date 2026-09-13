<script setup lang="ts" vapor>
const ready = ref(false)
const visible = ref(true)
const count = ref(2)
const burgerOpen = ref(false)
const groupValue = ref<string | number>('left')
const itemClicks = ref(0)
const radioValue = ref('first')
const radioChecked = ref(false)

const buttons = [
  { value: 'left', label: 'Left option' },
  { value: 'right', label: 'Right option' },
]

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="leaf-primitives-example"
    :data-ready="ready"
    flex="~ col gap-4"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        type="button"
        @click="count++"
      >
        Increment badge
      </button>
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
        @click="radioChecked = !radioChecked"
      >
        Toggle radio icon
      </button>
    </div>

    <div
      v-if="visible"
      data-testid="leaf-primitives-owner"
      flex="~ col gap-4"
    >
      <div flex="~ items-center gap-4">
        <Badge
          :counter="count"
          data-testid="leaf-badge"
        />
        <Badge data-testid="leaf-badge-slot">
          custom badge
        </Badge>
        <Burger
          v-model="burgerOpen"
          data-testid="leaf-burger"
        />
        <output
          data-example-output
          data-testid="burger-value"
        >{{ burgerOpen }}</output>
      </div>

      <ButtonGroup
        v-model="groupValue"
        :buttons
        data-testid="leaf-button-group"
      />
      <output
        data-example-output
        data-testid="button-group-value"
      >{{ groupValue }}</output>

      <Item
        tag="button"
        type="button"
        data-testid="leaf-item"
        @click="itemClicks++"
      >
        Clickable item
      </Item>
      <Item
        tag="div"
        readonly
        data-testid="leaf-item-readonly"
      >
        Readonly item
      </Item>
      <output
        data-example-output
        data-testid="item-clicks"
      >{{ itemClicks }}</output>

      <KeyboardShortcut
        char="K"
        with-ctrl
        with-shift
        force-visibility
        data-testid="leaf-shortcut"
      />

      <div flex="~ items-center gap-3">
        <Checkmark
          :delay="10"
          data-testid="leaf-checkmark"
        />
        <Close
          :delay="20"
          data-testid="leaf-close"
        />
        <Indeterminate
          :delay="30"
          data-testid="leaf-indeterminate"
        />
        <RadioButton
          :checked="radioChecked"
          data-testid="leaf-radio-icon"
        />
        <MovementElement data-testid="leaf-movement-element">
          <span>Attention</span>
        </MovementElement>
      </div>

      <div flex="~ items-center gap-3">
        <Radio
          v-model="radioValue"
          val="first"
          label="First radio"
          name="leaf-radio"
          data-testid="leaf-radio-first"
        />
        <Radio
          v-model="radioValue"
          val="second"
          name="leaf-radio"
          data-testid="leaf-radio-second"
        >
          <span>Second custom radio</span>
        </Radio>
        <Radio
          v-model="radioValue"
          val="disabled"
          label="Disabled radio"
          disabled
          name="leaf-radio"
          data-testid="leaf-radio-disabled"
        />
      </div>
      <output
        data-example-output
        data-testid="radio-value"
      >{{ radioValue }}</output>
    </div>
  </section>
</template>
