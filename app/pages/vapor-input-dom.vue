<script setup lang="ts">
const value = ref('initial')
const multiline = ref('notes')
const wide = ref(false)
const showPrepend = ref(true)
const generation = ref(0)
const files = ref<FileModel[]>([])
const simpleFiles = ref<FileModel[]>([])
</script>

<template>
  <main>
    <button
      data-example-control
      data-testid="resize-prepend"
      @click="wide = !wide"
    >
      Resize prepend
    </button>
    <button
      data-example-control
      data-testid="toggle-prepend"
      @click="showPrepend = !showPrepend"
    >
      Toggle prepend
    </button>
    <button
      data-example-control
      data-testid="remount-inputs"
      @click="generation++"
    >
      Remount inputs
    </button>
    <div :key="generation">
      <VaporInputDom
        id="native-input"
        v-model="value"
      />
      <VaporInputDom
        id="native-textarea"
        v-model="multiline"
        multiline
      />
      <output
        data-example-output
        aria-label="Native value"
        data-testid="native-value"
      >{{ value }}</output>
      <div data-testid="regular-input">
        <TextInput
          id="regular-input"
          label="Regular label"
          layout="regular"
        >
          <template #prepend>
            <span
              v-if="showPrepend"
              :style="{ display: 'block', width: wide ? '90px' : '30px' }"
            >P</span>
          </template>
        </TextInput>
      </div>
      <div data-testid="file-full">
        <FileInput
          v-model="files"
          multi
        >
          <span>Full drop target</span>
        </FileInput>
        <output
          data-example-output
          aria-label="Value"
        >{{ files.map(file => file.name).join(',') }}</output>
      </div>
      <div data-testid="file-simple">
        <FileInputSimple
          v-model="simpleFiles"
          multi
        />
        <output
          data-example-output
          aria-label="Value"
        >{{ simpleFiles.map(file => file.name).join(',') }}</output>
      </div>
    </div>
  </main>
</template>
