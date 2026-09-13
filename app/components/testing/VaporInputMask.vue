<script setup lang="ts" vapor>
const model = ref<number | null>(12.5)
const radix = ref(',')
const accepted = ref(0)
const visible = ref(true)
const inputVisible = ref(true)
const number = ref<number | null>(12.5)
const currency = ref<number | null>(0)
const date = ref('2026-05-20')
</script>

<template>
  <section flex="~ col gap-3">
    <VaporMaskedInput
      v-if="visible"
      v-model="model"
      :radix
      :input-visible
      :on-accepted="() => accepted++"
    />
    <output
      data-example-output
      aria-label="Mask accepted"
      data-testid="mask-accepted"
    >{{ accepted }}</output>
    <output
      data-example-output
      aria-label="Mask model"
      data-testid="mask-model"
    >{{ model ?? 'empty' }}</output>
    <div flex="~ gap-3 wrap">
      <button
        data-example-control
        @click="model = 0"
      >
        Set zero
      </button>
      <button
        data-example-control
        @click="model = null"
      >
        Clear model
      </button>
      <button
        data-example-control
        @click="radix = radix === ',' ? '.' : ','"
      >
        Change radix
      </button>
      <button
        data-example-control
        @click="inputVisible = !inputVisible"
      >
        Toggle input
      </button>
      <button
        data-example-control
        @click="visible = !visible"
      >
        Toggle owner
      </button>
    </div>
    <div data-testid="mask-number">
      <NumberInput v-model="number" />
      <output
        data-example-output
        aria-label="Value"
      >{{ number ?? 'empty' }}</output>
    </div>
    <div data-testid="mask-currency">
      <CurrencyInput v-model="currency" />
      <output
        data-example-output
        aria-label="Value"
      >{{ currency ?? 'empty' }}</output>
    </div>
    <div data-testid="mask-date">
      <DateInput
        v-model="date"
        format="YYYY-MM-DD"
      />
      <output
        data-example-output
        aria-label="Value"
      >{{ date }}</output>
    </div>
  </section>
</template>
