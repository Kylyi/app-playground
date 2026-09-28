<script setup lang="ts">
const { toggleDark } = useTheme()
const localePath = useLocalePath()
const route = useRoute()
const navigationOpen = ref(false)

type Example = {
  label: string
  path: string
  virtual?: boolean
  mode?: 'parent' | 'plain' | 'filtered' | 'basic' | 'tw' | 'inline' | 'label-inside' | 'inside'
  warning?: boolean
  loading?: boolean
  small?: boolean
  short?: boolean
  fullscreen?: boolean
  slow?: boolean
  autogrow?: boolean
  multi?: boolean
  controls?: boolean
  empty?: boolean
  feature?: 'filterChips'
  grouped?: boolean
}

const groups: { label: string, examples: Example[] }[] = [
  {
    label: 'Základní ukázky',
    examples: [
      { label: 'Hřiště komponent', path: '/' },
      { label: 'Vapor smoke test', path: '/vapor' },
      { label: 'Prezentační prvky · Vapor', path: '/vapor-presentation-primitives' },
      { label: 'Leaf prvky · Vapor', path: '/vapor-leaf-primitives' },
      { label: 'Stavové prvky · Vapor', path: '/vapor-status-primitives' },
      { label: 'Akční prvky · Vapor', path: '/vapor-action-primitives' },
      { label: 'Ovládací prvky · Vapor', path: '/vapor-control-primitives' },
      { label: 'Selector', path: '/selector-vapor' },
      { label: 'Tabulka · issue #28', path: '/issue-28' },
    ],
  },
  {
    label: 'Formuláře a stav',
    examples: [
      { label: 'Form · ArkType', path: '/vapor-form' },
      { label: 'Form · Zod', path: '/vapor-form-zod' },
      { label: 'DynamicInput · sloty a typy', path: '/vapor-dynamic-input' },
      { label: 'DurationInput · jednotky a sloty', path: '/vapor-duration-input' },
      { label: 'InputWrapper · layouty a label', path: '/vapor-input-layouts' },
      { label: 'InputWrapper · inline', path: '/vapor-input-layouts', mode: 'inline' },
      { label: 'InputWrapper · label uvnitř', path: '/vapor-input-layouts', mode: 'label-inside' },
      { label: 'Datum a čas · masky a pickery', path: '/vapor-date-time-inputs' },
      { label: 'DatePicker · události z VDOM rodiče', path: '/vdom-date-picker-events' },
      { label: 'Input · potvrzení, hint a chyby', path: '/vapor-input-feedback' },
      { label: 'CurrencyInput · měna a maska', path: '/vapor-currency-input' },
      { label: 'ColorInput · picker a RGBA', path: '/vapor-color-inputs' },
      { label: 'ColorInput · Tailwind barvy', path: '/vapor-color-inputs', mode: 'tw' },
      { label: 'TextArea · autogrow a sloty', path: '/vapor-text-area' },
      { label: 'TextArea · pevné řádky', path: '/vapor-text-area', autogrow: false },
      { label: 'TextInput · sloty, heslo a focus', path: '/vapor-text-input' },
      { label: 'NumberInput · maska a krokování', path: '/vapor-number-input' },
      { label: 'SearchInput · model a sloty', path: '/vapor-search-input' },
      { label: 'IconPicker · hledání a sloty', path: '/vapor-icon-picker' },
      { label: 'IconInput · picker a focus', path: '/vapor-icon-input' },
      { label: 'FileInput · sloty a soubory', path: '/vapor-file-input' },
      { label: 'FileInputInner · přidání souboru', path: '/vapor-file-input-inner' },
      { label: 'FileInputSimple · focus a scroller', path: '/vapor-file-input-simple' },
      { label: 'FileChip · stažení a události', path: '/vapor-file-chip' },
      { label: 'FilePreview · upload a životnost URL', path: '/vapor-upload-preview' },
      { label: 'FileStringPreview · potvrzení odebrání', path: '/vapor-file-string-preview' },
      { label: 'FileInput · více souborů', path: '/vapor-file-input', multi: true },
      { label: 'Input · DOM a focus', path: '/vapor-input-dom' },
      { label: 'Input · maska a lifecycle', path: '/vapor-input-mask' },
      { label: 'Input · kotvy menu', path: '/vapor-input-anchors' },
      { label: 'FilePreview · obrázek a dialog', path: '/vapor-file-preview' },
      { label: 'Události a submit', path: '/vapor-events' },
      { label: 'Btn · chování a DOM', path: '/vapor-button' },
      { label: 'Btn · loading', path: '/vapor-button', loading: true },
      { label: 'Ripple a Chip · Vapor', path: '/vapor-ripple' },
      { label: 'YearSelector · rok a lifecycle', path: '/vapor-year-selector' },
      { label: 'Stepper · kroky a ikony', path: '/vapor-stepper' },
      { label: 'Tabs · vnořené Tab', path: '/vapor-tabs', mode: 'basic' },
      { label: 'Tabs · cache panelů', path: '/vapor-tabs' },
      { label: 'Tabs · bez cache', path: '/vapor-tabs', mode: 'plain' },
      { label: 'Tabs · filtry cache', path: '/vapor-tabs', mode: 'filtered' },
      { label: 'Scopes a lifecycle', path: '/vapor-scopes' },
      { label: 'Viewport · SSR a hydratace', path: '/vapor-viewport' },
      { label: 'Dialog · programatické API', path: '/vapor-programmatic-dialog' },
      { label: 'Stav tabulky', path: '/vapor-table-state' },
      { label: 'Table a Pivot · DOM', path: '/vapor-table-pivot-dom' },
      { label: 'Table · migrované ovládání', path: '/vapor-table-pivot-dom', controls: true, feature: 'filterChips' },
      { label: 'Table · prázdný stav', path: '/vapor-table-pivot-dom', controls: true, feature: 'filterChips', empty: true },
      { label: 'Table · fetchMore', path: '/vapor-table-fetch-more' },
      { label: 'Table · Markdown v buňce', path: '/vapor-table-markdown' },
      { label: 'Table a Pivot · focus editorů', path: '/vapor-table-focus' },
      { label: 'Table · měření buněk', path: '/vapor-table-measurement' },
      { label: 'Table · editace buněk', path: '/vapor-table-edit' },
      { label: 'Table · editace 1 000 řádků', path: '/vapor-table-edit', virtual: true },
      { label: 'Table · responzivní grid', path: '/vapor-table-grid' },
      { label: 'Table · grid v úzkém panelu', path: '/vapor-table-grid', small: true },
      { label: 'Table · doplnění viewportu', path: '/vapor-table-fetch-more', short: true },
      { label: 'Table · celá obrazovka, 20 / 1 000', path: '/vapor-table-fetch-more', fullscreen: true },
      { label: 'Pivot · inicializační loading', path: '/vapor-table-pivot-dom', loading: true },
      { label: 'Pivot · potvrzení velkého výpočtu', path: '/vapor-table-pivot-dom', warning: true },
      { label: 'Pivot · připnuté skupiny řádků', path: '/vapor-table-pivot-dom', grouped: true },
      { label: 'QueryBuilder · hierarchie 24 podmínek', path: '/vapor-query-builder-dom' },
      { label: 'QueryBuilder · 3 podmínky', path: '/vapor-query-builder-dom', small: true },
    ],
  },
  {
    label: 'Overlaye',
    examples: [
      { label: 'Sdílený Tooltip', path: '/shared-tooltip' },
      { label: 'Dialog · anchor', path: '/vapor-dialog-anchor' },
      { label: 'Menu a Tooltip · anchors', path: '/vapor-overlay-anchors' },
      { label: 'MenuProxy · sloty a fallback', path: '/vapor-menu-proxy' },
      { label: 'MenuConfirmation · focus', path: '/vapor-menu-confirmation' },
      { label: 'Reference target', path: '/vapor-floating-target' },
      { label: 'Zavírání overlayů', path: '/vapor-hide' },
    ],
  },
  {
    label: 'Seznamy a scrollování',
    examples: [
      { label: 'Přesun a resize · Vapor', path: '/vapor-element-movement' },
      { label: 'CornerResize · hodnoty hran', path: '/vapor-corner-resize' },
      { label: 'ScrollArea', path: '/vapor-scroll-area' },
      { label: 'Scrollery · osy a lifecycle', path: '/vapor-scrollers' },
      { label: 'Scrollery · fade a vnitřní šipky', path: '/vapor-scrollers', mode: 'inside' },
      { label: 'VirtualScroller · měření řádků', path: '/vapor-virtual-scroller' },
      { label: 'VirtualScroller · 1 000 × 80', path: '/vapor-virtual-grid' },
      { label: 'VirtualScroller · async Markdown', path: '/vapor-virtual-markdown' },
      { label: 'VirtualScroller · pomalý Markdown', path: '/vapor-virtual-markdown', slow: true },
      { label: 'VirtualScroller · bez virtualizace', path: '/vapor-virtual-scroller', small: true },
      { label: 'Overflow', path: '/vapor-overflow' },
      { label: 'List · DOM a klávesnice', path: '/vapor-list-dom' },
      { label: 'List · drag & drop', path: '/vapor-list-drag' },
      { label: 'List · 1 000 položek', path: '/vapor-list-drag', virtual: true },
      { label: 'TreeDms · externí soubory', path: '/vapor-tree-dms-drop' },
      { label: 'Tree · řazení', path: '/vapor-tree-drag' },
      { label: 'Tree · přesun pod rodiče', path: '/vapor-tree-drag', mode: 'parent' },
      { label: 'Tree · hledání, akce a výběr', path: '/vapor-tree-drag', controls: true },
    ],
  },
]

function isActive(example: Example) {
  return route.path.replace(/\/$/, '') === localePath(example.path).replace(/\/$/, '')
    && (route.query.virtual === 'true') === !!example.virtual
    && (route.query.small === 'true') === !!example.small
    && (route.query.short === 'true') === !!example.short
    && (route.query.fullscreen === 'true') === !!example.fullscreen
    && (route.query.slow === 'true') === !!example.slow
    && (route.query.multi === 'true') === !!example.multi
    && (route.query.controls === 'true') === !!example.controls
    && (route.query.empty === 'true') === !!example.empty
    && !!route.query.loading === !!example.loading
    && (route.query.warning === 'true') === !!example.warning
    && (route.query.autogrow !== 'false') === (example.autogrow !== false)
    && route.query.mode === example.mode
    && route.query.feature === example.feature
    && (route.query.grouped === 'true') === !!example.grouped
}

const activeExample = computed(() => {
  return groups.flatMap(group => group.examples).find(isActive)
})

watch(() => route.fullPath, () => navigationOpen.value = false)
</script>

<template>
  <div class="playground-layout">
    <header class="playground-header">
      <NuxtLink
        :to="localePath('/')"
        class="playground-brand"
      >
        Gentl UI <span>Playground</span>
      </NuxtLink>
      <div class="playground-actions">
        <div class="playground-menu-button">
          <Btn
            label="Ukázky"
            outlined
            size="sm"
            aria-controls="example-navigation"
            :aria-expanded="navigationOpen"
            @click="navigationOpen = !navigationOpen"
          />
        </div>
        <Btn
          label="Přepnout motiv"
          outlined
          size="sm"
          @click="toggleDark()"
        />
        <LocaleSwitch />
      </div>
    </header>

    <div class="playground-body">
      <aside
        class="playground-sidebar"
        :class="{ 'is-open': navigationOpen }"
      >
        <nav
          id="example-navigation"
          aria-label="Ukázky komponent"
        >
          <section
            v-for="group in groups"
            :key="group.label"
            class="playground-group"
          >
            <h2>{{ group.label }}</h2>
            <Btn
              v-for="example in group.examples"
              :key="example.label"
              :label="example.label"
              align="left"
              no-uppercase
              :aria-current="isActive(example) ? 'page' : undefined"
              :ui="{
                containerClass: ({ defaults }) => [defaults.all, 'playground-link', { 'is-current': isActive(example) }],
              }"
              :to="localePath({
                path: example.path,
                query: {
                  autogrow: example.autogrow === false ? 'false' : undefined,
                  virtual: example.virtual ? 'true' : undefined,
                  mode: example.mode,
                  small: example.small ? 'true' : undefined,
                  short: example.short ? 'true' : undefined,
                  fullscreen: example.fullscreen ? 'true' : undefined,
                  slow: example.slow ? 'true' : undefined,
                  multi: example.multi ? 'true' : undefined,
                  controls: example.controls ? 'true' : undefined,
                  empty: example.empty ? 'true' : undefined,
                  feature: example.feature,
                  loading: example.loading ? 'true' : undefined,
                  warning: example.warning ? 'true' : undefined,
                  grouped: example.grouped ? 'true' : undefined,
                },
              })"
              size="sm"
              no-hover-effect
            />
          </section>
        </nav>
      </aside>

      <div class="playground-content">
        <h1 class="playground-page-title">
          {{ activeExample?.label ?? 'Ukázka' }}
        </h1>
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.playground-layout {
  @apply min-h-screen bg-white color-slate-900 dark:(bg-dark-900 color-slate-100);
}

.playground-header {
  @apply flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2 dark:border-slate-700;
}

.playground-brand {
  @apply flex items-baseline gap-2 font-bold no-underline;

  span {
    @apply text-sm font-normal color-slate-500 dark:color-slate-400;
  }
}

.playground-actions {
  @apply flex items-center gap-2;
}

.playground-menu-button {
  @apply hidden;
}

.playground-body {
  @apply grid;
  grid-template-columns: 240px minmax(0, 1fr);
}

.playground-sidebar {
  @apply sticky top-0 self-start overflow-y-auto border-r border-slate-200 p-3 dark:border-slate-700;
  max-height: 100dvh;
}

.playground-group {
  @apply mb-4;

  h2 {
    @apply mb-2 px-2 text-xs font-semibold uppercase tracking-wide color-slate-500 dark:color-slate-400;
  }
}

:deep(.playground-link) {
  @apply flex w-full justify-start rounded-md px-2 py-1.5 text-left text-sm normal-case no-underline whitespace-normal;

  &:hover {
    @apply bg-slate-100 dark:bg-slate-800;
  }

  &.is-current {
    @apply bg-blue-50 font-semibold dark:bg-slate-800;
    color: var(--example-accent);
  }

  &:focus-visible {
    @apply outline-2 outline-primary outline-offset-2;
  }
}

.playground-content {
  @apply min-w-0 p-6 bg-slate-50 dark:bg-dark-950;
}

.playground-content > :deep(main),
.playground-content > :deep(section) {
  @apply rounded-xl border border-slate-200 bg-white p-5 dark:(border-slate-700 bg-dark-900);
}

.playground-page-title {
  @apply mb-5 text-xl font-semibold;
}

@media (max-width: 767px) {
  .playground-header {
    flex-wrap: wrap;
  }

  .playground-brand {
    white-space: nowrap;
  }

  .playground-actions {
    margin-left: auto;
  }

  .playground-content {
    padding: 16px;
  }

  .playground-menu-button {
    display: block;
  }

  .playground-body {
    grid-template-columns: minmax(0, 1fr);
  }

  .playground-sidebar {
    display: none;
    border-right: 0;
    border-bottom: 1px solid;
    max-height: 60vh;
    overflow-y: auto;

    &.is-open {
      display: block;
    }
  }
}
</style>
