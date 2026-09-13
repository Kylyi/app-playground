<script setup lang="ts">
import type { listGetExposed } from '../../packages/UI/app/components/List/functions/list-get-exposed'
import { formSubmitKey } from '../../packages/UI/app/components/Form/provide/form.provide'

const list = useTemplateRef<ReturnType<typeof listGetExposed>>('list')
const submits = ref(0)
const formSubmits = ref(0)
provide(formSubmitKey, () => formSubmits.value++)

function submitExposed() {
  list.value?.handleKey(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true }), { force: true })
}
</script>

<template>
  <main>
    <VaporScrollEvents />
    <output
      data-example-output
      aria-label="List submits"
      data-testid="list-submits"
    >{{ submits }}</output>
    <output
      data-example-output
      aria-label="Form submits"
      data-testid="form-submits"
    >{{ formSubmits }}</output>
    <button
      data-example-control
      data-testid="exposed-submit"
      @click="submitExposed"
    >
      Submit through public API
    </button>
    <div data-testid="list-events">
      <List
        ref="list"
        :items="[{ id: 1, label: 'Alpha' }, { id: 2, label: 'Beta' }]"
        :search-config="{ enabled: false }"
        @submit="submits++"
      >
        <template #item="{ row }">
          <button data-example-control>
            {{ row.label }}
          </button>
        </template>
      </List>
    </div>
  </main>
</template>
