// @unocss-include

type ISize = 'xs' | 'sm' | 'md' | 'lg'
type ISide = 'start' | 'end' | 'alternate'
type IMarkerAlign = 'start' | 'center'

/**
 * Layout is driven by CSS variables set on the container (and `--tl-m`, `--tl-color` on each item):
 * - `--tl-marker`: size of icon / avatar / number markers
 * - `--tl-dot`: size of dot markers
 * - `--tl-rail`: width of the marker column
 * - `--tl-gap`: horizontal gap between the rail and the content / opposite columns
 * - `--tl-item-gap`: vertical gap between items
 * - `--tl-line`: line height of the title, the marker is centered against the first line
 * - `--tl-connector-gap`: space between the marker and its connectors
 */
export const TIMELINE_FEED_DEFAULT_PROPS = {
  ui: {
    containerClass(payload: {
      side: ISide
      size: ISize
      dense: boolean
      dotsOnly: boolean
    }) {
      const { side: sideProp, size: sizeProp, dense: denseProp, dotsOnly } = payload

      const base = 'grid m-0 p-0 list-none [--tl-connector-gap:0px]'

      // All items share the parent's columns through `subgrid`, so the opposite column (`auto`) has one width
      const sides = {
        end: 'grid-cols-[auto_var(--tl-rail)_minmax(0,1fr)]',
        start: 'grid-cols-[minmax(0,1fr)_var(--tl-rail)_auto]',
        alternate: 'grid-cols-[minmax(0,1fr)_var(--tl-rail)_minmax(0,1fr)]',
      } as const

      const side = sides[sideProp]

      const sizes = {
        xs: '[--tl-marker:1.25rem] [--tl-dot:0.5rem] [--tl-gap:0.5rem] [--tl-item-gap-base:1rem] [--tl-line:1rem]',
        sm: '[--tl-marker:1.5rem] [--tl-dot:0.625rem] [--tl-gap:0.75rem] [--tl-item-gap-base:1.25rem] [--tl-line:1.25rem]',
        md: '[--tl-marker:2rem] [--tl-dot:0.75rem] [--tl-gap:1rem] [--tl-item-gap-base:1.5rem] [--tl-line:1.25rem]',
        lg: '[--tl-marker:2.5rem] [--tl-dot:0.875rem] [--tl-gap:1.25rem] [--tl-item-gap-base:2rem] [--tl-line:1.5rem]',
      } as const

      const size = sizes[sizeProp]

      const dense = denseProp
        ? '[--tl-item-gap:calc(var(--tl-item-gap-base)*0.4)]'
        : '[--tl-item-gap:var(--tl-item-gap-base)]'

      const rail = dotsOnly ? '[--tl-rail:var(--tl-dot)]' : '[--tl-rail:var(--tl-marker)]'

      return {
        base,
        sides,
        sizes,
        dense,
        rail,
        all: `${base} ${side} ${size} ${dense} ${rail}`,
      } as const
    },

    itemClass() {
      const base = 'relative grid col-span-full grid-cols-[subgrid]'

      // The marker size of this item
      const markerSize = '[--tl-m:var(--tl-marker)] [&.is-dot]:[--tl-m:var(--tl-dot)]'

      return {
        base,
        markerSize,
        all: `${base} ${markerSize}`,
      } as const
    },

    oppositeClass(payload: {
      markerAlign: IMarkerAlign
    }) {
      const { markerAlign } = payload

      const base = 'row-start-1 min-w-0'

      // The opposite column is on the other side than the content
      const sides = '[&.is-end]:(col-start-1 pr-[var(--tl-gap)] text-right) [&.is-start]:(col-start-3 pl-[var(--tl-gap)] text-left)'

      const aligns = {
        start: 'pt-[max(0px,calc((var(--tl-m)-var(--tl-line))/2))] pb-[var(--tl-item-gap)] [&.is-last]:pb-0',
        center: 'self-center py-[calc(var(--tl-item-gap)/2)]',
      } as const

      const align = aligns[markerAlign]

      return {
        base,
        sides,
        aligns,
        all: `${base} ${sides} ${align}`,
      } as const
    },

    railClass() {
      const base = 'row-start-1 col-start-2 flex flex-col items-center min-h-full'

      return {
        base,
        all: base,
      } as const
    },

    markerClass(payload: {
      size: ISize
    }) {
      const { size: sizeProp } = payload

      const base = 'relative flex flex-center shrink-0 box-border rounded-full overflow-hidden font-semibold leading-none tabular-nums select-none'
      const dimensions = 'w-[var(--tl-m)] h-[var(--tl-m)]'
      const transition = 'transition-[color,background-color,border-color,box-shadow] duration-200'

      // Variants ~ everything is derived from the item's `--tl-color`, dark mode lightens the text for contrast
      const filled = '[&.is-filled]:(bg-[var(--tl-color)] color-white)'
      const outline = '[&.is-outline]:(border-2 border-solid border-[color:var(--tl-color)] color-[var(--tl-color)] dark:(border-[color:color-mix(in_srgb,var(--tl-color)_75%,white)] color-[color-mix(in_srgb,var(--tl-color)_60%,white)]))'
      const soft = '[&.is-soft]:(bg-[color-mix(in_srgb,var(--tl-color)_16%,transparent)] color-[var(--tl-color)] dark:(bg-[color-mix(in_srgb,var(--tl-color)_28%,transparent)] color-[color-mix(in_srgb,var(--tl-color)_55%,white)]))'

      // A soft dot would be barely visible, it gets a solid center and a soft halo instead
      const softDot = '[&.is-soft.is-dot]:(bg-[var(--tl-color)] shadow-[0_0_0_4px_color-mix(in_srgb,var(--tl-color)_22%,transparent)])'

      // The avatar is inset, so the variant shows as a ring around it
      const avatar = '[&.is-avatar]:p-[2px]'

      const sizes = {
        xs: 'font-rem-10',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      } as const

      const size = sizes[sizeProp]

      return {
        base,
        dimensions,
        transition,
        filled,
        outline,
        soft,
        softDot,
        avatar,
        sizes,
        all: `${base} ${dimensions} ${transition} ${filled} ${outline} ${soft} ${softDot} ${avatar} ${size}`,
      } as const
    },

    iconClass() {
      const base = 'shrink-0 w-[calc(var(--tl-m)*0.55)] h-[calc(var(--tl-m)*0.55)]'
      const pending = '[&.is-pending]:animate-spin'

      return {
        base,
        pending,
        all: `${base} ${pending}`,
      } as const
    },

    connectorClass(payload: {
      connector: 'solid' | 'dashed' | 'dotted'
      connectorColor: 'neutral' | 'item'
      markerAlign: IMarkerAlign
    }) {
      const { connector: connectorProp, connectorColor: colorProp, markerAlign } = payload

      const base = 'block w-0 border-0 border-l-2'

      const connectors = {
        solid: 'border-solid',
        dashed: 'border-dashed',
        dotted: 'border-dotted',
      } as const

      const connector = connectors[connectorProp]

      // The segment above the marker belongs to the previous item ~ `--tl-prev-color`
      const colors = {
        neutral: 'border-true-gray-300 dark:border-true-gray-700',
        item: '[&.is-after]:border-[color:var(--tl-color)] [&.is-before]:border-[color:var(--tl-prev-color)]',
      } as const

      const color = colors[colorProp]

      // `start`: a short segment aligning the marker with the title, `center`: equal segments around the marker
      const aligns = {
        start: '[&.is-before]:(shrink-0 h-[max(0px,calc((var(--tl-line)-var(--tl-m))/2-var(--tl-connector-gap)))])',
        // A pending last item's tail is mirrored above the marker, so the marker stays centered against the content
        center: '[&.is-before]:flex-1 [&.is-last.is-before.is-pending]:min-h-10',
      } as const

      const align = aligns[markerAlign]

      const before = '[&.is-before]:mb-[var(--tl-connector-gap)] [&.is-first.is-before]:invisible'
      const after = '[&.is-after]:(flex-1 mt-[var(--tl-connector-gap)]) [&.is-last.is-after]:invisible'

      // Connectors next to a pending item are dashed, a pending last item gets a fading tail
      const pending = '[&.is-pending]:border-dashed [&.is-last.is-after.is-pending]:(visible min-h-10 [mask-image:linear-gradient(to_bottom,black,transparent)])'

      return {
        base,
        connectors,
        colors,
        aligns,
        before,
        after,
        pending,
        all: `${base} ${connector} ${color} ${align} ${before} ${after} ${pending}`,
      } as const
    },

    contentClass(payload: {
      markerAlign: IMarkerAlign
    }) {
      const { markerAlign } = payload

      const base = 'row-start-1 min-w-0 flex flex-col'
      const sides = '[&.is-end]:(col-start-3 pl-[var(--tl-gap)] items-start text-left) [&.is-start]:(col-start-1 pr-[var(--tl-gap)] items-end text-right)'

      const aligns = {
        start: 'pt-[max(0px,calc((var(--tl-m)-var(--tl-line))/2))] pb-[var(--tl-item-gap)] [&.is-last]:pb-0',
        center: 'self-center py-[calc(var(--tl-item-gap)/2)]',
      } as const

      const align = aligns[markerAlign]

      return {
        base,
        sides,
        aligns,
        all: `${base} ${sides} ${align}`,
      } as const
    },

    headerClass() {
      const base = 'flex flex-wrap items-baseline gap-x-2 max-w-full'
      const sides = '[&.is-start]:flex-row-reverse'

      return {
        base,
        sides,
        all: `${base} ${sides}`,
      } as const
    },

    titleClass(payload: {
      size: ISize
    }) {
      const { size: sizeProp } = payload

      const base = 'min-w-0 font-semibold leading-[var(--tl-line)] color-darker dark:color-white'
      const muted = '[&.is-muted]:color-ca'

      const sizes = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-sm',
        lg: 'text-base',
      } as const

      const size = sizes[sizeProp]

      return {
        base,
        muted,
        sizes,
        all: `${base} ${muted} ${size}`,
      } as const
    },

    timeClass(payload: {
      size: ISize
    }) {
      const { size: sizeProp } = payload

      const base = 'block color-ca whitespace-nowrap tabular-nums leading-[var(--tl-line)]'

      const sizes = {
        xs: 'font-rem-10',
        sm: 'text-xs',
        md: 'text-xs',
        lg: 'text-sm',
      } as const

      const size = sizes[sizeProp]

      return {
        base,
        sizes,
        all: `${base} ${size}`,
      } as const
    },

    descriptionClass(payload: {
      size: ISize
      dense: boolean
    }) {
      const { size: sizeProp, dense: denseProp } = payload

      const base = 'm-0 color-ca leading-snug max-w-prose'
      const dense = denseProp ? 'line-clamp-1' : 'mt-0.5'

      const sizes = {
        xs: 'font-rem-11',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-sm',
      } as const

      const size = sizes[sizeProp]

      return {
        base,
        dense,
        sizes,
        all: `${base} ${dense} ${size}`,
      } as const
    },

    bodyClass(payload: {
      dense: boolean
    }) {
      const base = 'min-w-0 max-w-full empty:hidden'
      const dense = payload.dense ? 'mt-1' : 'mt-2'

      return {
        base,
        dense,
        all: `${base} ${dense}`,
      } as const
    },
  },
}
