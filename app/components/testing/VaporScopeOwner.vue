<script setup lang="ts" vapor>
import { type } from 'arktype'
import { z } from 'zod'

const props = defineProps<{ label: string }>()
const state = ref({ value: '' })
useArk({ state, schema: type({ value: 'string > 0' }), name: props.label })
useZod({ state, schema: z.object({ value: z.string().min(1) }), name: props.label })
const { files } = useFiles()

function addFile() {
  files.value = [new FileModel({ file: new File(['test'], `${props.label}.txt`) })]
}
</script>

<template>
  <button
    data-example-control
    :data-testid="`add-${label}`"
    @click="addFile"
  >
    Add {{ label }} file
  </button>
</template>
