import type { ITreeScrollerConfig } from '#layers/ui/app/components/Tree/types/tree-props.type'

type Assert<T extends true> = T
type Config = ITreeScrollerConfig<{ key: number, title: string }>

// Compile-time regression: Tree renders the main scroller and owns its rows/IDs.
export type TreeScrollerOptions = Assert<
  'threshold' | 'overscan' | 'initialRowsRenderCount' | 'noScrollEmit' extends keyof Config ? true : false
>
export type TreeOwnedOptions = Assert<
  Extract<keyof Config, 'rows' | 'rowKey' | 'columns' | 'virtualizerOptions'> extends never ? true : false
>
