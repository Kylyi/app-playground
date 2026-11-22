// @unocss-include

export type ITimelineComposableOrientation = 'vertical' | 'horizontal'
export type ITimelineComposableSide = 'start' | 'end' | 'alternate'
export type ITimelineComposableSize = 'xs' | 'sm' | 'md' | 'lg'

/**
 * Named colors resolve to these classes, any other value is used as a CSS color (`#ff0`, `rgb(...)`, `var(--x)`)
 *
 * NOTE: The class is applied to the item's rail, the marker and connectors paint with `currentColor`
 */
export const TIMELINE_COMPOSABLE_COLORS = {
  primary: 'color-primary',
  secondary: 'color-secondary',
  tertiary: 'color-tertiary',
  positive: 'color-positive',
  negative: 'color-negative',
  warning: 'color-warning',
  info: 'color-info',
  neutral: 'color-true-gray-500 dark:color-true-gray-400',
} as const

export type ITimelineComposableColor = keyof typeof TIMELINE_COMPOSABLE_COLORS

/**
 * All per-item variations (status, side, line style, ...) are expressed through state classes
 * (`is-completed`, `is-side-start`, `is-dashed`, ...) on the elements, so the class strings below only depend
 * on the timeline-wide `orientation`, `side` and `size` ~ they are computed once in `TimelineComposable`
 * and shared by all items
 */
export const TIMELINE_COMPOSABLE_DEFAULT_PROPS = {
  ui: {
    containerClass(payload: {
      orientation: ITimelineComposableOrientation
      size: ITimelineComposableSize
    }) {
      const { orientation: orientationProp, size: sizeProp } = payload

      const base = 'timeline-composable relative w-full'

      const orientations = {
        vertical: '',
        horizontal: 'overflow-x-auto overflow-y-hidden overscroll-x-contain p-b-2 scroll-smooth',
      } as const

      // Size variants ~ marker size, dot size and spacing are shared through CSS variables
      const sizes = {
        xs: '[--tlc-marker:1.25rem] [--tlc-dot:0.5rem] [--tlc-gap:0.75rem] [--tlc-offset:0.5rem]',
        sm: '[--tlc-marker:1.5rem] [--tlc-dot:0.625rem] [--tlc-gap:1rem] [--tlc-offset:0.625rem]',
        md: '[--tlc-marker:2rem] [--tlc-dot:0.75rem] [--tlc-gap:1.5rem] [--tlc-offset:0.75rem]',
        lg: '[--tlc-marker:2.5rem] [--tlc-dot:0.875rem] [--tlc-gap:2rem] [--tlc-offset:1rem]',
      } as const

      return {
        base,
        orientations,
        sizes,
        all: `${base} ${orientations[orientationProp]} ${sizes[sizeProp]}`,
      } as const
    },

    listClass(payload: {
      orientation: ITimelineComposableOrientation
      side: ITimelineComposableSide
    }) {
      const { orientation: orientationProp, side: sideProp } = payload

      const base = 'grid m-0 p-0 list-none'

      // Vertical: [opposite | rail | content] columns, shared by the items through subgrid so the rail stays aligned
      const sides = {
        end: 'grid-cols-[auto_auto_minmax(0,1fr)]',
        start: 'grid-cols-[minmax(0,1fr)_auto_auto]',
        alternate: 'grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]',
      } as const

      // Horizontal: [top | rail | bottom] rows, shared by the items through subgrid
      const horizontal = 'grid-flow-col grid-rows-[auto_auto_auto] auto-cols-[minmax(var(--tlc-item-width),1fr)]'

      const layout = orientationProp === 'vertical' ? sides[sideProp] : horizontal

      return {
        base,
        sides,
        horizontal,
        all: `${base} ${layout}`,
      } as const
    },

    itemClass(payload: {
      orientation: ITimelineComposableOrientation
    }) {
      const { orientation: orientationProp } = payload

      const base = 'timeline-composable-item relative min-w-0'

      const orientations = {
        vertical: 'col-span-full grid [grid-template-columns:subgrid]',
        horizontal: 'row-span-full grid [grid-template-rows:subgrid]',
      } as const

      const disabled = '[&.is-disabled]:opacity-60'

      return {
        base,
        orientations,
        disabled,
        all: `${base} ${orientations[orientationProp]} ${disabled}`,
      } as const
    },

    railClass(payload: {
      orientation: ITimelineComposableOrientation
    }) {
      const { orientation: orientationProp } = payload

      const base = 'timeline-composable-rail flex items-center'

      const orientations = {
        vertical: 'col-start-2 row-start-1 flex-col',
        horizontal: 'row-start-2 relative justify-center',
      } as const

      return {
        base,
        orientations,
        all: `${base} ${orientations[orientationProp]}`,
      } as const
    },

    markerClass(payload: {
      size: ITimelineComposableSize
    }) {
      const { size: sizeProp } = payload

      const base = 'timeline-composable-marker relative z-1 flex flex-center shrink-0 box-border rounded-full p-0 m-0'
      const dimensions = 'w-[var(--tlc-marker)] h-[var(--tlc-marker)]'
      const shape = 'border-2 border-solid border-current bg-current font-semibold leading-none tabular-nums'
      const transition = 'transition-[color,background-color,box-shadow,transform] duration-200'

      // State styling via CSS selectors
      const upcoming = '[&.is-upcoming]:(bg-white border-true-gray-300 color-true-gray-400 dark:(bg-darker border-true-gray-600 color-true-gray-500))'
      const pending = '[&.is-pending]:(bg-white dark:bg-darker)'
      const error = '[&.is-error]:color-negative'
      const active = '[&.is-active:not(.is-dot)]:shadow-[0_0_0_4px_color-mix(in_srgb,currentColor_22%,transparent)]'
      const dot = '[&.is-dot]:(bg-transparent! border-transparent!)'
      const interactive = '[&.is-clickable]:(cursor-pointer hover:scale-110) focus-visible:(outline-2 outline-solid outline-offset-2 outline-primary)'

      // Size variants
      const sizes = {
        xs: 'font-rem-10',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      } as const

      return {
        base,
        dimensions,
        shape,
        transition,
        upcoming,
        pending,
        error,
        active,
        dot,
        interactive,
        sizes,
        all: `${base} ${dimensions} ${shape} ${transition} ${upcoming} ${pending} ${error} ${active} ${dot} ${interactive} ${sizes[sizeProp]}`,
      } as const
    },

    dotClass() {
      const base = 'timeline-composable-dot block box-border rounded-full w-[var(--tlc-dot)] h-[var(--tlc-dot)]'
      const shape = 'border-2 border-solid border-current bg-current transition-[background-color,box-shadow] duration-200'

      // State styling via CSS selectors
      const upcoming = '[&.is-upcoming]:(bg-white dark:bg-darker)'
      const active = '[&.is-active]:shadow-[0_0_0_4px_color-mix(in_srgb,currentColor_25%,transparent)]'

      return {
        base,
        shape,
        upcoming,
        active,
        all: `${base} ${shape} ${upcoming} ${active}`,
      } as const
    },

    // Icon or number inside the marker ~ white on a filled marker, `currentColor` on an outlined one
    iconClass(payload: {
      size: ITimelineComposableSize
    }) {
      const { size: sizeProp } = payload

      const base = 'timeline-composable-icon shrink-0 color-white'
      const outlined = '[&.is-upcoming,&.is-pending]:color-current'

      const sizes = {
        xs: '[&.is-icon]:(w-3 h-3)',
        sm: '[&.is-icon]:(w-3.5 h-3.5)',
        md: '[&.is-icon]:(w-4 h-4)',
        lg: '[&.is-icon]:(w-5 h-5)',
      } as const

      return {
        base,
        outlined,
        sizes,
        all: `${base} ${outlined} ${sizes[sizeProp]}`,
      } as const
    },

    connectorClass(payload: {
      orientation: ITimelineComposableOrientation
    }) {
      const { orientation: orientationProp } = payload

      const base = 'timeline-composable-connector box-border border-current transition-colors duration-200'

      // Line style via state classes (the timeline's `lineStyle` or the item's own)
      const styles = 'border-solid [&.is-dashed]:border-dashed [&.is-dotted]:border-dotted'

      // A connector leading to an upcoming item is muted
      const unreached = '[&.is-unreached]:(color-true-gray-300 dark:color-true-gray-600)'

      const orientations = {
        vertical: 'flex-1 [border-left-width:var(--tlc-line-width)] min-h-4 m-y-1 [&.is-dot]:m-y-[calc(var(--tlc-dot)/2-var(--tlc-marker)/2+0.25rem)]',
        // Spans from this marker to the next one ~ the columns share the same width
        horizontal: 'absolute top-[calc(50%-var(--tlc-line-width)/2)] left-[calc(50%+var(--tlc-marker)/2+0.25rem)] w-[calc(100%-var(--tlc-marker)-0.5rem)] [border-top-width:var(--tlc-line-width)] [&.is-dot]:(left-[calc(50%+var(--tlc-dot)/2+0.25rem)] w-[calc(100%-var(--tlc-dot)-0.5rem)])',
      } as const

      return {
        base,
        styles,
        unreached,
        orientations,
        all: `${base} ${styles} ${unreached} ${orientations[orientationProp]}`,
      } as const
    },

    contentClass(payload: {
      orientation: ITimelineComposableOrientation
    }) {
      const { orientation: orientationProp } = payload

      const base = 'timeline-composable-content flex flex-col min-w-0'

      const orientations = {
        vertical: 'row-start-1 p-b-[var(--tlc-gap)] [&.is-last]:p-b-0 [&.is-side-end]:(col-start-3 p-l-[var(--tlc-offset)]) [&.is-side-start]:(col-start-1 p-r-[var(--tlc-offset)] items-end text-right)',
        horizontal: 'items-center text-center p-x-2 [&.is-side-end]:(row-start-3 p-t-2) [&.is-side-start]:(row-start-1 p-b-2 justify-end)',
      } as const

      return {
        base,
        orientations,
        all: `${base} ${orientations[orientationProp]}`,
      } as const
    },

    oppositeClass(payload: {
      orientation: ITimelineComposableOrientation
      size: ITimelineComposableSize
    }) {
      const { orientation: orientationProp, size: sizeProp } = payload

      const base = 'timeline-composable-opposite flex flex-col min-w-0 color-ca leading-snug'

      const orientations = {
        vertical: 'row-start-1 justify-start p-t-[calc((var(--tlc-marker)-1.375em)/2)] [&.is-side-end]:(col-start-1 items-end text-right p-r-[var(--tlc-offset)]) [&.is-side-start]:(col-start-3 items-start p-l-[var(--tlc-offset)])',
        horizontal: 'items-center text-center p-x-2 [&.is-side-end]:(row-start-1 justify-end p-b-2) [&.is-side-start]:(row-start-3 p-t-2)',
      } as const

      const sizes = {
        xs: 'font-rem-10',
        sm: 'text-xs',
        md: 'text-xs',
        lg: 'text-sm',
      } as const

      return {
        base,
        orientations,
        sizes,
        all: `${base} ${orientations[orientationProp]} ${sizes[sizeProp]}`,
      } as const
    },

    headerClass(payload: {
      orientation: ITimelineComposableOrientation
    }) {
      const { orientation: orientationProp } = payload

      const base = 'timeline-composable-header group/tlc-header flex gap-x-3 gap-y-0.5 max-w-full p-0 m-0 bg-transparent border-none color-inherit font-inherit text-inherit rounded-custom outline-none'
      const interactive = '[&.is-interactive]:cursor-pointer focus-visible:(ring-2 ring-primary/50) disabled:cursor-default'

      const orientations = {
        vertical: 'w-full min-h-[var(--tlc-marker)] items-center flex-wrap justify-between text-left [&.is-side-start]:(flex-row-reverse text-right)',
        horizontal: 'flex-col-reverse items-center text-center',
      } as const

      return {
        base,
        interactive,
        orientations,
        all: `${base} ${interactive} ${orientations[orientationProp]}`,
      } as const
    },

    titleClass(payload: {
      size: ITimelineComposableSize
    }) {
      const { size: sizeProp } = payload

      const base = 'timeline-composable-title flex items-center gap-1 font-semibold leading-snug color-darker dark:color-white transition-colors'

      // State styling via CSS selectors
      const upcoming = '[&.is-upcoming]:(color-true-gray-500 dark:color-true-gray-400)'
      const pending = '[&.is-pending]:(font-normal italic color-ca)'
      const error = '[&.is-error]:color-negative'
      const interactive = '[&.is-interactive]:group-hover/tlc-header:color-primary dark:[&.is-interactive]:group-hover/tlc-header:color-sky-300'

      const sizes = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-sm',
        lg: 'text-base',
      } as const

      return {
        base,
        upcoming,
        pending,
        error,
        interactive,
        sizes,
        all: `${base} ${upcoming} ${pending} ${error} ${interactive} ${sizes[sizeProp]}`,
      } as const
    },

    timeClass(payload: {
      size: ITimelineComposableSize
    }) {
      const { size: sizeProp } = payload

      const base = 'timeline-composable-time shrink-0 color-ca whitespace-nowrap tabular-nums leading-snug'

      const sizes = {
        xs: 'font-rem-10',
        sm: 'text-xs',
        md: 'text-xs',
        lg: 'text-sm',
      } as const

      return {
        base,
        sizes,
        all: `${base} ${sizes[sizeProp]}`,
      } as const
    },

    descriptionClass(payload: {
      size: ITimelineComposableSize
    }) {
      const { size: sizeProp } = payload

      const base = 'timeline-composable-description color-ca leading-snug'

      const sizes = {
        xs: 'font-rem-10',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-sm',
      } as const

      return {
        base,
        sizes,
        all: `${base} ${sizes[sizeProp]}`,
      } as const
    },

    expandIconClass() {
      const base = 'timeline-composable-expand-icon shrink-0 w-4 h-4 color-ca transition-transform duration-200'
      const expanded = '[&.is-expanded]:rotate-180'

      return {
        base,
        expanded,
        all: `${base} ${expanded}`,
      } as const
    },

    // Wrapper of the default slot ~ animates its height through `grid-template-rows` when collapsible
    bodyClass(payload: {
      size: ITimelineComposableSize
    }) {
      const { size: sizeProp } = payload

      const base = 'timeline-composable-body grid min-w-0 transition-[grid-template-rows,opacity] duration-250 ease-out'
      const collapsible = '[&.is-collapsible]:(grid-rows-[0fr] opacity-0) [&.is-collapsible.is-expanded]:(grid-rows-[1fr] opacity-100)'
      const inner = '[&>*]:(min-h-0 overflow-hidden)'

      const sizes = {
        xs: 'text-xs',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      } as const

      return {
        base,
        collapsible,
        inner,
        sizes,
        all: `${base} ${collapsible} ${inner} ${sizes[sizeProp]}`,
      } as const
    },
  },
}
