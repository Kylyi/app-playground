<script setup lang="ts" vapor>
import { z } from 'zod'

const props = defineProps<{ scope: string, title: string }>()
const model = defineModel<{
  name: string
  address: { city: string, zip: string }
}>({ required: true })

// Identical paths in both scopes make accidental cross-scope lookup observable.
const schema = z.object({
  name: z.string().min(2),
  address: z.object({
    city: z.string().min(2),
    zip: z.string().regex(/^\d{5}$/),
  }),
})
const { validate, reset } = useZod({
  state: model,
  schema,
  scope: props.scope,
  name: 'VaporZodValidationForm',
})
const submissions = ref(0)
const submitted = ref('')

function submit() {
  if (!validate().isValid) {
    return
  }
  submissions.value++
  submitted.value = JSON.stringify(model.value)
}
</script>

<template>
  <section
    :data-testid="`form-${scope}`"
    flex="~ col gap-4"
    border="1 ca rounded"
    p="4"
  >
    <h2>{{ title }} · scope: {{ scope }}</h2>
    <Form
      label="Uložit"
      :submit-confirmation="false"
      no-shortcuts
      no-edit-controls
      @submit="submit"
    >
      <div data-testid="name-field">
        <TextInput
          v-model="model.name"
          label="Jméno"
          :validation-path="scope === 'base' ? 'name' : { scope, path: 'name' }"
          error-takes-space
        />
      </div>
      <VaporFormAddress
        v-model="model.address"
        :scope
      />
    </Form>
    <Btn
      outlined
      label="Skrýt chyby tohoto scope"
      type="button"
      @click="reset"
    />
    <p>
      Úspěšná odeslání: <output
        data-example-output
        aria-label="Submissions"
        data-testid="submissions"
      >{{ submissions }}</output>
    </p>
    <pre data-testid="submitted">{{ submitted }}</pre>
  </section>
</template>
