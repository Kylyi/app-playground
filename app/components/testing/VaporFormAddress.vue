<script setup lang="ts" vapor>
defineProps<{ scope: string }>()
const model = defineModel<{ city: string, zip: string }>({ required: true })
</script>

<template>
  <fieldset flex="~ col gap-4">
    <legend>Adresa · vnořená Vapor komponenta</legend>
    <div data-testid="city-field">
      <TextInput
        v-model="model.city"
        label="Město"
        :validation-path="scope === 'base' ? 'address.city' : { scope, path: 'address.city' }"
        error-takes-space
      />
    </div>
    <div data-testid="zip-field">
      <TextInput
        v-model="model.zip"
        label="PSČ"
        :validation-path="scope === 'base' ? 'address.zip' : { scope, path: 'address.zip' }"
        error-takes-space
      />
    </div>
  </fieldset>
</template>
