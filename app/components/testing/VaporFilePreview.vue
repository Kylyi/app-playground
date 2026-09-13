<script setup lang="ts" vapor>
const ready = ref(false)
const visible = ref(true)
const file = shallowRef<IFile | FileModel>({ name: 'Remote image', path: '/testing/preview.svg', type: 'image/svg+xml', size: 213 })
let sequence = 0

function replace(kind: 'image' | 'video' | 'document') {
  const type = kind === 'image' ? 'image/svg+xml' : kind === 'video' ? 'video/mp4' : 'text/plain'
  const content = kind === 'image'
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><rect width="160" height="90" fill="coral"/></svg>'
    : 'Preview fixture'
  const local = new FileModel({ file: new File([content], `Local ${++sequence}`, { type }) })
  local.uploadProgress = 100
  file.value = local
  visible.value = true
}

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="file-preview-fixture"
    :data-ready="ready"
    flex="~ col gap-4"
  >
    <div flex="~ gap-2">
      <button
        data-example-control
        @click="replace('image')"
      >
        Local image
      </button>
      <button
        data-example-control
        @click="replace('video')"
      >
        Local video
      </button>
      <button
        data-example-control
        @click="replace('document')"
      >
        Document
      </button>
      <button
        data-example-control
        @click="visible = !visible"
      >
        Toggle preview
      </button>
    </div>
    <FilePreview2
      v-if="visible"
      :file
      editable
      @remove="visible = false"
    />
  </section>
</template>
