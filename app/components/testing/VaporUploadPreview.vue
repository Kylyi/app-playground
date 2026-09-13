<script setup lang="ts" vapor>
const ready = ref(false)
const visible = ref(true)
const noPreview = ref(false)
const noDownload = ref(true)
const file = ref<IFile | FileModel>({ name: 'Remote image', path: '/testing/preview.svg', type: 'image/svg+xml', size: 213 })
let sequence = 0

function localImage() {
  file.value = new FileModel({
    file: new File([
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><rect width="160" height="90" fill="coral"/></svg>',
    ], `Local ${++sequence}`, { type: 'image/svg+xml' }),
  })
}

function setUpload(state: 'uploading' | 'failed' | 'uploaded') {
  if (file.value instanceof FileModel) {
    file.value.hasError = state === 'failed'
    file.value.uploadProgress = state === 'uploaded' ? 100 : 50
  }
}

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="upload-preview-example"
    :data-ready="ready"
    flex="~ col gap-3"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        type="button"
        @click="localImage"
      >
        Local image
      </button>
      <button
        data-example-control
        type="button"
        @click="noPreview = !noPreview"
      >
        Toggle image
      </button>
      <button
        data-example-control
        type="button"
        @click="noDownload = !noDownload"
      >
        Toggle download
      </button>
      <button
        data-example-control
        type="button"
        @click="visible = !visible"
      >
        Toggle owner
      </button>
      <button
        data-example-control
        type="button"
        @click="setUpload('uploading')"
      >
        Uploading
      </button>
      <button
        data-example-control
        type="button"
        @click="setUpload('failed')"
      >
        Failed
      </button>
      <button
        data-example-control
        type="button"
        @click="setUpload('uploaded')"
      >
        Uploaded
      </button>
    </div>
    <FilePreview
      v-if="visible"
      data-testid="upload-preview"
      :file
      :no-preview
      :no-download-button="noDownload"
      editable
      download-url="/vapor-chip-example.txt"
      file-download-title="Download file"
      @remove="visible = false"
    />
  </section>
</template>
