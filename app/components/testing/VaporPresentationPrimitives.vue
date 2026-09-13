<script setup lang="ts" vapor>
const ready = ref(false)
const visible = ref(true)
const progress = ref(25)
const vertical = ref(false)
const skeletonVariant = ref<'wave' | 'pulse' | 'blink'>('wave')
const loaderVariant = ref<'inline' | 'block'>('block')
const collapseOpen = ref(false)
const bannerVisible = ref(true)
const bannerCounter = ref(1)
const sectionLoading = ref(false)

const breadcrumbs = [
  { label: 'Library', to: '/library' },
  { label: 'Current page' },
]

function formatDiagnosticValue(_row: unknown, value: unknown) {
  return `formatted:${String(value)}`
}

function formatProgress(value?: number) {
  return `Loaded ${value ?? 0}%`
}

onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="presentation-primitives-example"
    :data-ready="ready"
    flex="~ col gap-4"
  >
    <div flex="~ wrap gap-2">
      <button
        data-example-control
        type="button"
        @click="progress = progress === 25 ? 70 : 25"
      >
        Change progress
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
        @click="vertical = !vertical"
      >
        Toggle separator
      </button>
      <button
        data-example-control
        type="button"
        @click="bannerVisible = true"
      >
        Show banner
      </button>
      <button
        data-example-control
        type="button"
        @click="bannerCounter++"
      >
        Increment banner
      </button>
      <button
        data-example-control
        type="button"
        @click="sectionLoading = !sectionLoading"
      >
        Toggle section loading
      </button>
      <select
        v-model="skeletonVariant"
        data-example-control
        aria-label="Skeleton variant"
      >
        <option value="wave">
          Wave
        </option>
        <option value="pulse">
          Pulse
        </option>
        <option value="blink">
          Blink
        </option>
      </select>
      <select
        v-model="loaderVariant"
        data-example-control
        aria-label="Loader variant"
      >
        <option value="block">
          Block
        </option>
        <option value="inline">
          Inline
        </option>
      </select>
    </div>

    <div
      v-if="visible"
      data-testid="presentation-owner"
      flex="~ col gap-4"
    >
      <Navigation
        sticky
        no-hide
        data-testid="presentation-navigation"
      >
        <span data-testid="navigation-content">Navigation content</span>
      </Navigation>

      <MainBar
        title="Presentation main bar"
        subtitle="Main bar subtitle"
        no-breadcrumbs
        data-testid="presentation-main-bar"
      >
        <template #left>
          <span data-testid="main-bar-left">Left</span>
        </template>
        <template #title-append>
          <span data-testid="main-bar-title-append">Append</span>
        </template>
        <template #right>
          <span data-testid="main-bar-right">Right</span>
        </template>
        <template #inner>
          <span data-testid="main-bar-inner">Inner</span>
        </template>
      </MainBar>

      <Breadcrumbs
        :breadcrumbs
        data-testid="presentation-breadcrumbs"
      >
        <template #append>
          <span data-testid="breadcrumbs-append">Append</span>
        </template>
        <template #right>
          <span data-testid="breadcrumbs-right">Right</span>
        </template>
      </Breadcrumbs>

      <Banner
        v-model="bannerVisible"
        :counter="bannerCounter"
        variant="info"
        dismissable
        no-transition
        data-testid="presentation-banner"
      >
        Banner content
      </Banner>

      <Section
        title="Presentation section"
        subtitle="Section subtitle"
        :loading="sectionLoading"
        data-testid="presentation-section"
      >
        <span data-testid="section-content">Section content</span>
      </Section>

      <PageTitle
        title="Presentation title"
        data-testid="presentation-page-title"
      >
        <template #prepend>
          <span data-testid="page-title-prepend">Before</span>
        </template>
        <template #append>
          <span data-testid="page-title-append">After</span>
        </template>
        <template #below>
          <span data-testid="page-title-below">Below</span>
        </template>
      </PageTitle>

      <Collapse
        v-model="collapseOpen"
        title="Collapsible section"
        data-testid="presentation-collapse"
      >
        <span data-testid="collapse-content">Collapse content</span>
      </Collapse>

      <Heading
        highlighted
        :ui="{ containerStyle: () => ({ minHeight: '32px' }) }"
        data-testid="presentation-heading"
      >
        Presentation primitives
      </Heading>

      <FieldWithFormatter
        model-value="field-value"
        data-type="string"
        label="Formatted field"
        data-testid="formatted-field"
      >
        <template #append>
          <span data-testid="formatted-append">append</span>
        </template>
      </FieldWithFormatter>

      <ValueFormatter
        value="current"
        previous-value="previous"
        :format="formatDiagnosticValue"
        data-testid="formatted-value"
      >
        <template #default="{ val }">
          <span data-testid="formatted-current">{{ val }}</span>
        </template>
        <template #previousValue="{ val }">
          <span data-testid="formatted-previous">{{ val }}</span>
        </template>
      </ValueFormatter>

      <div
        data-testid="separator-shell"
        :style="{ height: vertical ? '48px' : 'auto' }"
      >
        <Separator
          :vertical
          spaced
          inset
          data-testid="presentation-separator"
        >
          separator
        </Separator>
      </div>

      <Skeleton
        :variant="skeletonVariant"
        :animation-speed="800"
        :ui="{ containerStyle: () => ({ height: '24px' }) }"
        data-testid="presentation-skeleton"
      />

      <div flex="~ items-center gap-4">
        <Loader
          :variant="loaderVariant"
          data-testid="presentation-loader"
        />
        <LoaderBlock
          size="xs"
          data-testid="presentation-loader-block"
        />
        <LoaderInline
          :size="6"
          data-testid="presentation-loader-inline"
        />
      </div>

      <ProgressBar
        :progress
        :label="formatProgress"
        data-testid="presentation-progress"
      />
      <CircleProgress
        :progress
        :size="80"
        data-testid="presentation-circle"
      >
        <span data-testid="circle-slot">slot</span>
      </CircleProgress>
    </div>
  </section>
</template>
