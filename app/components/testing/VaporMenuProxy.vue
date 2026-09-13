<script setup lang="ts" vapor>
const ready = ref(false)
const opened = ref(false)
const customTitle = ref(false)
const customHeader = ref(false)
const headerRight = ref(false)
const label = ref('Custom title')
const anchor = ref<HTMLElement>()
const menu = useTemplateRef('menu')
onMounted(() => ready.value = true)
</script>

<template>
  <section
    data-testid="menu-proxy-example"
    :data-ready="ready"
    flex="~ col gap-3"
  >
    <div
      data-proxy-controls
      flex="~ wrap gap-2"
    >
      <button
        ref="anchor"
        data-example-control
        type="button"
        @click="menu?.show()"
      >
        Open proxy
      </button>
      <button
        data-example-control
        type="button"
        @click="customTitle = !customTitle"
      >
        Toggle title slot
      </button>
      <button
        data-example-control
        type="button"
        @click="customHeader = !customHeader"
      >
        Toggle header slot
      </button>
      <button
        data-example-control
        type="button"
        @click="headerRight = !headerRight"
      >
        Toggle header right
      </button>
      <button
        data-example-control
        type="button"
        @click="label = 'Updated title'"
      >
        Update title
      </button>
    </div>
    <output
      data-example-output
      aria-label="Proxy model"
      data-testid="proxy-model"
    >{{ opened }}</output>
    <MenuProxy
      ref="menu"
      v-model="opened"
      :target="anchor"
      title="Fallback title"
      :ignore-click-outside="['[data-proxy-controls]']"
      manual
      no-transition
      no-overlay
      w="80"
    >
      <template
        v-if="customTitle"
        #title="{ hide }"
      >
        <button
          data-example-control
          type="button"
          @click="hide()"
        >
          {{ label }}
        </button>
      </template>
      <template
        v-if="customHeader"
        #header="{ hide }"
      >
        <button
          data-example-control
          type="button"
          @click="hide()"
        >
          Close custom header
        </button>
      </template>
      <template
        v-if="headerRight"
        #header-right
      >
        <span data-testid="proxy-header-right">Header action</span>
      </template>
      <template #default="{ hide }">
        <button
          data-example-control
          type="button"
          @click="hide()"
        >
          Close proxy content
        </button>
      </template>
    </MenuProxy>

    <Btn
      outlined
      label="X"
    >
      <Menu
        title="x"
        w="70"
        persistent
      >
        <Btn>Test</Btn>
      </Menu>
    </Btn>
  </section>
</template>
