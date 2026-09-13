<script setup lang="ts">
const empty = ref('')
const filled = ref('123 456 789')
const wide = ref(false)
const visible = ref(true)
const ready = ref(false)
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="prepend-preview"
    :data-ready="ready"
    flex="~ col gap-5"
    p="4"
  >
    <h2>Kontrola labelu s prependem</h2>
    <p>Klikni do polí, napiš text a zkus změnit šířku nebo skrýt prepend.</p>
    <div flex="~ wrap gap-2">
      <Btn
        outlined
        :label="wide ? 'Úzký prepend' : 'Široký prepend'"
        @click="wide = !wide"
      />
      <Btn
        outlined
        :label="visible ? 'Skrýt prepend' : 'Zobrazit prepend'"
        @click="visible = !visible"
      />
    </div>
    <TextInput
      v-model="empty"
      label="Telefon — původně prázdný"
      layout="regular"
      :stack-label="false"
      clearable
    >
      <template #prepend>
        <span
          v-if="visible"
          :style="{ width: wide ? '150px' : '64px' }"
          text="center"
        >{{ wide ? 'Česká republika +420' : '+420' }}</span>
      </template>
    </TextInput>
    <TextInput
      v-model="filled"
      label="Telefon — původně vyplněný"
      layout="regular"
      :stack-label="false"
      clearable
    >
      <template #prepend>
        <span
          v-if="visible"
          :style="{ width: wide ? '150px' : '64px' }"
          text="center"
        >{{ wide ? 'Česká republika +420' : '+420' }}</span>
      </template>
    </TextInput>
  </section>
</template>
