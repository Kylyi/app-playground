<script setup lang="ts" vapor>
import { ComparatorEnum } from '$comparatorEnum'

const ready = ref(false)
const visible = ref(true)
const editable = ref(false)
const value = ref<string | number | null>('Current')
const relativeItem = reactive({ value: '', comparator: ComparatorEnum.EQUAL })
const month = ref<Datetime>('2026-12-15T12:00:00Z')
const relativeInput = useTemplateRef<{ focus: () => void }>('relativeInput')
const monthLabel = computed(() => $date(month.value, { utc: true }).format('YYYY-MM'))
const zeroSelection = ref(0)
const zeroOptions = [{ id: 0, label: 'Zero item' }, { id: 1, label: 'One item' }]
const multiSelection = ref<number | number[] | undefined>(0)
const chipScroller = ref(false)

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="value-contracts"
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
        @click="editable = !editable"
      >
        Toggle editable
      </button>
      <button
        data-example-control
        type="button"
        @click="value = null"
      >
        Empty value
      </button>
      <button
        data-example-control
        type="button"
        @click="value = 0"
      >
        Zero value
      </button>
      <button
        data-example-control
        type="button"
        @click="relativeInput?.focus()"
      >
        Focus relative time
      </button>
      <button
        data-example-control
        type="button"
        @click="relativeItem.value = '2we'"
      >
        Replace relative time
      </button>
    </div>
    <div
      v-if="visible"
      data-testid="value-contracts-owner"
      flex="~ col gap-4"
    >
      <MiniCard
        data-testid="mini-card"
        label="Mini card"
        :value
        original-value="Original"
        previous-value="Previous"
        empty-value-string="Empty"
      />
      <InputBlock
        data-testid="input-block"
        label="Readonly value"
        :value
        :editable
        empty-value-string="Empty"
      >
        <input
          v-model="value"
          aria-label="Editable block"
          data-testid="block-editor"
        >
      </InputBlock>
      <InputBlock
        data-testid="custom-input-block"
        label="Custom readonly value"
        :value
        :editable
      >
        <template #readonly="{ val }">
          <span>Custom: {{ val }}</span>
        </template>
        <span data-testid="custom-block-editor">Editing custom block</span>
      </InputBlock>
      <QueryBuilderTimeAgoInput
        ref="relativeInput"
        :item="relativeItem"
        data-testid="relative-time"
      />
      <output
        data-example-output
        data-testid="relative-value"
      >{{ relativeItem.value || 'empty' }}</output>
      <MonthSelector
        v-model="month"
        utc
        data-testid="month-selector"
      />
      <output
        data-example-output
        data-testid="month-value"
      >{{ monthLabel }}</output>
      <List
        v-model:selection="zeroSelection"
        :items="zeroOptions"
        :selection-config="{ enabled: true, emitKey: true }"
        :search-config="{ enabled: false }"
        :sorting-config="{ enabled: false }"
        data-testid="zero-list"
      />
      <output
        data-example-output
        data-testid="zero-selection"
      >{{ zeroSelection }}</output>
      <button
        data-example-control
        type="button"
        @click="chipScroller = !chipScroller"
      >
        Toggle chip scroller
      </button>
      <button
        data-example-control
        type="button"
        @click="multiSelection = [0]"
      >
        Restore zero chip
      </button>
      <Selector
        v-model="multiSelection"
        :options="zeroOptions"
        :use-scroller="chipScroller"
        multi
        emit-key
        data-testid="zero-selector"
      />
    </div>
  </section>
</template>
