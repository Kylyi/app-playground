// @unocss-include

// Types
import type { ITimelineLogType } from '../types/timeline-log-props.type'

type ITimelineLogLayout = 'compact' | 'card'
type ITimelineLogMarker = 'icon' | 'dot' | 'none'

/**
 * Built-in item kinds ~ UnoCSS icon classes are used as they are pure CSS (no component per row)
 */
export const TIMELINE_LOG_DEFAULT_TYPES: Record<string, ITimelineLogType> = {
  default: { icon: 'i-lucide:circle-small', color: 'rgb(115 115 115)', label: 'Event' },
  created: { icon: 'i-lucide:plus', color: 'positive', label: 'Created' },
  updated: { icon: 'i-lucide:pencil', color: 'info', label: 'Updated' },
  deleted: { icon: 'i-lucide:trash-2', color: 'negative', label: 'Deleted' },
  comment: { icon: 'i-lucide:message-square', color: 'primary', label: 'Comment' },
  status: { icon: 'i-lucide:refresh-cw', color: 'secondary', label: 'Status change' },
  info: { icon: 'i-lucide:info', color: 'info', label: 'Info' },
  warning: { icon: 'i-lucide:triangle-alert', color: 'warning', label: 'Warning' },
  error: { icon: 'i-lucide:circle-x', color: 'negative', label: 'Error' },
}

export const TIMELINE_LOG_THEME_COLORS = new Set([
  'primary',
  'secondary',
  'tertiary',
  'positive',
  'negative',
  'warning',
  'info',
])

export const TIMELINE_LOG_DEFAULT_PROPS = {
  ui: {
    containerClass(payload: { dense: boolean }) {
      const { dense } = payload

      // Layout variables ~ `--tl-line` is the height of the first line of an item (marker, time and title align to it)
      const base = 'timeline-log relative flex flex-col text-sm [--tl-gap:0.75rem] [--tl-surface:#fff] dark:[--tl-surface:#121212]'

      const densities = {
        normal: '[--tl-line:1.75rem] [--tl-card-pad:0.5rem]',
        dense: '[--tl-line:1.25rem] [--tl-card-pad:0.25rem] [--tl-gap:0.5rem]',
      } as const

      const density = densities[dense ? 'dense' : 'normal']

      return {
        base,
        densities,
        all: `${base} ${density}`,
      } as const
    },

    groupClass() {
      const base = 'timeline-log-group flex flex-col'

      return {
        base,
        all: base,
      } as const
    },

    groupHeaderClass(payload: { sticky: boolean, collapsible: boolean }) {
      const { sticky, collapsible } = payload

      const base = 'flex items-center gap-2 w-full p-y-2 p-x-0 m-0 border-none bg-[var(--tl-surface)] text-left font-rem-11 font-semibold uppercase tracking-wider color-ca'
      const stickyClass = 'sticky top-0 z-2'
      const collapsibleClass = 'cursor-pointer outline-none hover:color-current focus-visible:(ring-2 ring-primary/50 rounded-custom)'

      return {
        base,
        sticky: stickyClass,
        collapsible: collapsibleClass,
        all: `${base} ${sticky ? stickyClass : ''} ${collapsible ? collapsibleClass : ''}`,
      } as const
    },

    listClass(payload: { connector: boolean }) {
      const { connector } = payload

      const base = 'relative flex flex-col m-0 p-0 list-none'

      // A single line per group instead of one per item ~ positioned by `--tl-line-x`
      const connectorClass = 'before:(content-empty absolute top-0 bottom-0 left-[var(--tl-line-x)] w-px bg-true-gray-200 dark:bg-true-gray-700)'

      return {
        base,
        connector: connectorClass,
        all: `${base} ${connector ? connectorClass : ''}`,
      } as const
    },

    itemClass(payload: { layout: ITimelineLogLayout, dense: boolean }) {
      const { layout, dense } = payload

      const base = 'relative flex items-start gap-[var(--tl-gap)]'

      // Off-screen items skip layout & paint, `auto` remembers their real size once rendered
      const performance = '[content-visibility:auto]'

      const layouts = {
        compact: dense ? 'p-y-0.5 [contain-intrinsic-size:auto_1.5rem]' : 'p-y-1 [contain-intrinsic-size:auto_2.25rem]',
        card: dense ? 'p-y-1 [contain-intrinsic-size:auto_4rem]' : 'p-y-1.5 [contain-intrinsic-size:auto_6rem]',
      } as const

      return {
        base,
        performance,
        layouts,
        all: `${base} ${performance} ${layouts[layout]}`,
      } as const
    },

    timeClass(payload: { layout: ITimelineLogLayout, placement: 'gutter' | 'inline' }) {
      const { layout, placement } = payload

      const base = 'shrink-0 whitespace-nowrap tabular-nums color-ca'

      const placements = {
        gutter: 'flex items-center justify-end w-[var(--tl-gutter)] h-[var(--tl-line)] text-xs',
        inline: 'font-rem-12',
      } as const

      const cardOffset = placement === 'gutter' && layout === 'card' ? 'm-t-[var(--tl-card-pad)]' : ''

      return {
        base,
        placements,
        all: `${base} ${placements[placement]} ${cardOffset}`,
      } as const
    },

    markerClass(payload: { marker: ITimelineLogMarker, layout: ITimelineLogLayout, dense: boolean }) {
      const { marker, layout, dense } = payload

      // The marker's own background hides the connector line behind it
      const base = 'relative z-1 flex flex-center shrink-0 color-[var(--tl-color)] dark:color-[color-mix(in_srgb,var(--tl-color)_65%,white)]'

      const markers = {
        icon: `${dense ? 'w-4.5 h-4.5 [&>*]:(w-2.75 h-2.75)' : 'w-6 h-6 [&>*]:(w-3.5 h-3.5)'} m-y-[calc((var(--tl-line)_-_var(--tl-rail))/2)] rounded-full bg-[color-mix(in_srgb,var(--tl-color)_16%,var(--tl-surface))] ring-2 ring-[var(--tl-surface)]`,
        dot: 'w-[var(--tl-rail)] h-[var(--tl-line)] after:(content-empty w-2.5 h-2.5 rounded-full bg-[var(--tl-color)] ring-2 ring-[var(--tl-surface)])',
        none: 'hidden',
      } as const

      const cardOffset = layout === 'card' ? 'm-t-[var(--tl-card-pad)]' : ''

      return {
        base,
        markers,
        all: `${base} ${markers[marker]} ${cardOffset}`,
      } as const
    },

    contentClass(payload: { layout: ITimelineLogLayout }) {
      const { layout } = payload

      const layouts = {
        compact: 'flex items-center gap-2 flex-1 min-w-0 min-h-[var(--tl-line)]',
        card: 'flex flex-col gap-1 flex-1 min-w-0 p-x-3 p-y-[var(--tl-card-pad)] rounded-custom border-1 border-solid border-true-gray-200 dark:border-true-gray-700 bg-white dark:bg-white/3 shadow-sm shadow-black/3',
      } as const

      return {
        layouts,
        all: layouts[layout],
      } as const
    },

    titleClass(payload: { layout: ITimelineLogLayout }) {
      const { layout } = payload

      const base = 'min-w-0 truncate color-darker dark:color-true-gray-100'

      const layouts = {
        compact: '',
        card: 'font-medium',
      } as const

      return {
        base,
        layouts,
        all: `${base} ${layouts[layout]}`,
      } as const
    },

    descriptionClass() {
      const base = 'color-ca font-rem-13 leading-snug line-clamp-3'

      return {
        base,
        all: base,
      } as const
    },

    footerClass() {
      const base = 'flex flex-center gap-2 p-y-3 min-h-12 font-rem-12 color-ca'

      return {
        base,
        all: base,
      } as const
    },
  },
}
