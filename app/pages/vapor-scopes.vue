<script setup lang="ts">
import { useValidationStore } from '#layers/ui/app/stores/validation.store'

const store = useValidationStore()
const { allFiles } = useFiles()
const visible = ref(true)
// Child registration finishes during hydration; publish aggregate diagnostics after mount.
const ready = ref(false)
const parts = computed(() => store.validationParts.value.length)
const owners = computed(() => new Set(store.validationParts.value.map(part => part.componentName)).size)
const visibleOwners = computed(() => Object.keys(store.isValidationVisibleByComponentName.value).length)
const errors = computed(() => store.errorsStructure.value.byScope.base?.length ?? 0)
const filenames = computed(() => allFiles.value.map(file => file.name).sort().join(','))
onMounted(() => ready.value = true)
</script>

<template>
  <main
    data-testid="scope-probe"
    :data-ready="ready"
  >
    <VaporScopeOwner
      v-if="visible"
      label="first"
    />
    <VaporScopeOwner label="second" />
    <button
      data-example-control
      data-testid="toggle-owner"
      @click="visible = !visible"
    >
      Toggle first owner
    </button>
    <button
      data-example-control
      data-testid="validate-owners"
      @click="store.validate('base')"
    >
      Validate
    </button>
    <output
      data-example-output
      aria-label="Parts"
      data-testid="parts"
    >{{ ready ? parts : 'pending' }}</output>
    <output
      data-example-output
      aria-label="Owners"
      data-testid="owners"
    >{{ ready ? owners : 'pending' }}</output>
    <output
      data-example-output
      aria-label="Visible owners"
      data-testid="visible-owners"
    >{{ ready ? visibleOwners : 'pending' }}</output>
    <output
      data-example-output
      aria-label="Errors"
      data-testid="errors"
    >{{ ready ? errors : 'pending' }}</output>
    <output
      data-example-output
      aria-label="Files"
      data-testid="files"
    >{{ filenames }}</output>
  </main>
</template>
