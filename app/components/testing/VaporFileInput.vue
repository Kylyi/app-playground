<script setup lang="ts" vapor>
const route = useRoute()
const multi = route.query.multi === 'true'
const ready = ref(false)
const model = ref<FileModel[]>([])
const slotsVisible = ref(false)
const visible = ref(true)
const addedCount = ref(0)
const removedCount = ref(0)

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="file-input-example"
    :data-ready="ready"
    flex="~ col gap-3"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        type="button"
        @click="slotsVisible = !slotsVisible"
      >
        Toggle slots
      </button>
      <button
        data-example-control
        type="button"
        @click="visible = !visible"
      >
        Toggle input owner
      </button>
    </div>
    <FileInput
      v-if="visible"
      v-model="model"
      data-testid="file-input-field"
      :multi
      accept="text/plain"
      no-preview
      no-download-button
      @files-added="addedCount += $event.length"
      @files-removed="removedCount += $event.length"
    >
      <template
        v-if="slotsVisible"
        #default="{ openFileDialog, removeFile, isOverDropZone }"
      >
        <div
          data-testid="file-input-custom"
          :data-dragging="isOverDropZone"
          flex="~ col gap-2"
          p="4"
        >
          <button
            data-example-control
            type="button"
            @click="openFileDialog()"
          >
            Choose files
          </button>
          <div
            v-for="(file, index) in model"
            :key="index"
            flex="~ gap-2 items-center"
          >
            <span>{{ file.name }}</span>
            <button
              data-example-control
              type="button"
              @click="removeFile(index)"
            >
              Remove {{ file.name }}
            </button>
          </div>
        </div>
      </template>
      <template
        v-if="slotsVisible"
        #empty="{ openFileDialog }"
      >
        <button
          v-if="!model.length"
          data-example-control
          data-testid="file-input-empty-custom"
          type="button"
          @click="openFileDialog()"
        >
          Choose first file
        </button>
      </template>
    </FileInput>
    <output
      data-example-output
      data-testid="file-input-names"
    >{{ model.map(file => file.name).join(',') || 'empty' }}</output>
    <output
      data-example-output
      data-testid="file-input-events"
    >{{ addedCount }}/{{ removedCount }}</output>
  </section>
</template>
