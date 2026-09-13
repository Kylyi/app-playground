<script setup lang="ts">
import { useValidationStore } from '#layers/ui/app/stores/validation.store'

// Both Vapor owners must share a provider for scope isolation to be meaningful.
const store = useValidationStore()
const primary = ref({ name: '', address: { city: '', zip: '' } })
const billing = ref({ name: '', address: { city: '', zip: '' } })
const billingVisible = ref(true)
const ready = ref(false)
const registrations = computed(() => store.validationParts.value.length)
onMounted(() => ready.value = true)
</script>

<template>
  <main
    data-testid="vapor-form-page"
    :data-ready="ready"
    flex="~ col gap-5"
    p="6"
    overflow="auto"
  >
    <h1>Vapor · Form a Zod validace</h1>
    <p>
      Dva nezávislé scopes se stejnými cestami. Jméno a město vyžadují alespoň
      dva znaky, PSČ přesně pět číslic. Chyby se zobrazí až po odeslání.
      Vlastní komponenty používají Vapor, UI Form a TextInput zatím VDOM interop.
    </p>
    <Btn
      outlined
      :label="billingVisible ? 'Odpojit fakturační formulář' : 'Připojit fakturační formulář'"
      data-testid="toggle-billing"
      @click="billingVisible = !billingVisible"
    />
    <p>
      Registrovaná schémata: <output
        data-example-output
        aria-label="Registrations"
        data-testid="registrations"
      >{{ ready ? registrations : 'pending' }}</output>
    </p>
    <div flex="~ col gap-5">
      <VaporZodValidationForm
        v-model="primary"
        scope="base"
        title="Kontaktní údaje"
      />
      <VaporZodValidationForm
        v-if="billingVisible"
        v-model="billing"
        scope="billing"
        title="Fakturační údaje"
      />
    </div>
  </main>
</template>
