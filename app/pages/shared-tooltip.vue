<script setup lang="ts" vapor>
import Tooltip from '../../packages/UI/app/components/Tooltip/Tooltip.vue'
import TooltipSlotContext from '../components/testing/TooltipSlotContext.vue'

provide('tooltip-test-context', 'Author context preserved')

const a = ref(false)
const b = ref(false)
const label = ref('Beta content')

const alternate = useTemplateRef<HTMLButtonElement>('alternate')
const referenceTarget = shallowRef<HTMLElement | null>(null)

const mounted = ref(true)
const manual = ref(false)
const ready = ref(false)

onMounted(() => {
  ready.value = true
})
</script>

<template>
  <main
    data-testid="shared-tooltip-page"
    :data-ready="ready"
    p="8"
  >
    <h1>Shared tooltip</h1>

    <button
      data-example-control
      @click="notify({ title: 'Automatic notification host', timeout: 0 })"
    >
      Show notification
    </button>

    <div
      flex="~ gap-32"
      m="y-12"
    >
      <button
        data-example-control
        data-testid="tooltip-trigger-a"
      >
        Alpha

        <Tooltip
          v-if="mounted"
          v-model="a"
          :manual
          :delay="[400, 300]"
          :content="{ title: 'Alpha content' }"
          placement="bottom"
          data-testid="shared-bubble"
        />
      </button>

      <button
        data-example-control
        data-testid="tooltip-trigger-b"
      >
        Beta

        <Tooltip
          v-if="mounted"
          v-model="b"
          :reference-target="referenceTarget"
          :manual
          :delay="[400, 300]"
          placement="bottom"
          data-testid="shared-bubble"
        >
          <template #default="{ contentClass }">
            <div :class="contentClass">
              <span>{{ label }}</span>
              <TooltipSlotContext />
            </div>
          </template>
        </Tooltip>
      </button>
    </div>

    <button
      ref="alternate"
      data-example-control
      data-testid="alternate-target"
      m="l-100"
    >
      Alternate target
    </button>

    <button
      data-example-control
      @click="referenceTarget = alternate"
    >
      Move Beta target
    </button>

    <button
      data-example-control
      @click="referenceTarget = null"
    >
      Reset Beta target
    </button>

    <output
      data-example-output
      aria-label="Tooltip models"
      data-testid="tooltip-models"
    >{{ a }}/{{ b }}</output>

    <button
      data-example-control
      @click="label = 'Updated Beta'"
    >
      Update content
    </button>

    <button
      data-example-control
      @click="manual = !manual"
    >
      Toggle manual
    </button>

    <button
      data-example-control
      @click="a = true"
    >
      Open Alpha
    </button>

    <button
      data-example-control
      @click="b = true"
    >
      Open Beta
    </button>

    <button
      data-example-control
      @click="b = false"
    >
      Close Beta
    </button>

    <button
      data-example-control
      @click="mounted = !mounted"
    >
      Toggle declarations
    </button>
  </main>
</template>
