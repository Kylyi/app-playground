<script setup lang="ts" vapor>
import IconRenderer from '#layers/ui/app/components/Icon/IconRenderer.vue'

const { data: names } = useFetch('/api/playground/runtime-icons')
const slowMode = useRoute().query.mode === 'slow'
const ready = ref(false)
const mounted = ref(true)
const alternate = ref(false)
const slow = ref(slowMode)
const failed = ref(false)
const active = computed(() => failed.value ? names.value?.failed : slow.value ? names.value?.slow : alternate.value ? names.value?.alternate : names.value?.mask)
const legacy = computed(() => [names.value?.legacy, 'rotate-90', 'runtime-icon-size'])
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="runtime-icons"
    :data-ready="ready"
    flex="~ col gap-4"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        @click="failed = false; slow = false; alternate = !alternate"
      >
        Change runtime icon
      </button>
      <button
        data-example-control
        @click="failed = true"
      >
        Fail runtime icon provider
      </button>
      <button
        data-example-control
        @click="slow = true"
      >
        Start slow runtime icon
      </button>
      <button
        data-example-control
        @click="mounted = !mounted"
      >
        Toggle icon owner
      </button>
    </div>
    <div
      v-if="mounted && names"
      data-testid="icon-owner"
      class="icon-samples"
    >
      <div class="sample">
        <span>Runtime mask</span>
        <IconRenderer
          v-if="active"
          :name="active"
          data-testid="runtime-mask"
        />
      </div>
      <div class="sample">
        <span>Multicolor SVG</span>
        <IconRenderer
          :name="names.background"
          data-testid="runtime-background"
        />
      </div>
      <div class="sample">
        <span>Custom SVG</span>
        <IconRenderer
          :name="names.custom"
          data-testid="runtime-custom"
        />
      </div>
      <div class="sample">
        <span>Alias</span>
        <IconRenderer
          :name="names.alias"
          data-testid="runtime-alias"
        />
      </div>
      <div class="sample">
        <span>Static hashed asset</span>
        <IconRenderer
          name="lucide:check"
          data-testid="static-icon"
        />
      </div>
      <div class="sample">
        <span>Missing icon fallback</span>
        <IconRenderer
          :name="names.missing"
          data-testid="missing-icon"
        />
      </div>
      <Btn
        label="Runtime button"
        :icon="active"
        data-testid="runtime-button"
      />
      <Chip
        label="Runtime legacy chip"
        :icon="legacy"
        data-testid="runtime-chip"
      />
    </div>
  </section>
</template>

<style scoped>
.icon-samples {
  @apply grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))];
}
.sample {
  @apply flex items-center justify-between gap-3 p-4 border-1 border-ca rounded-custom;
}
.sample :deep([data-icon]) {
  @apply color-primary w-8 h-8;
}
:deep(.runtime-icon-size) {
  @apply w-4 h-4;
}
</style>
