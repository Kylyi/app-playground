<script setup lang="ts" vapor>
const visible = ref(true)
const hidden = ref(0)
const ready = ref(false)
onMounted(() => ready.value = true)
</script>

<template>
  <section
    :data-ready="ready"
    data-testid="programmatic-dialog"
    flex="~ col gap-3"
  >
    <button
      data-example-control
      @click="visible = !visible"
    >
      Toggle dialog owner
    </button>
    <output
      data-example-output
      aria-label="Hidden count"
      data-testid="hidden-count"
    >{{ hidden }}</output>
    <VaporProgrammaticDialogOwner
      v-if="visible"
      :on-hidden="() => hidden++"
    />
  </section>
</template>
