import type { ComponentProps, IComponent } from '#layers/utilities/app/types/component-map.type'
import type Tree from '#layers/ui/app/components/Tree/Tree.vue'
import type TextInput from '#layers/ui/app/components/Inputs/TextInput/TextInput.vue'
import type { IFormProps, IUILinkProps } from '$uiProps'
import type { ComponentExposed } from 'vue-component-type-helpers'

// Generic SFCs have callable type signatures. Their public props must remain
// usable in a typed registry, while invalid configuration is still rejected.
export const treeProps = { search: 'consumer', noKeyboard: false } satisfies ComponentProps<typeof Tree>
export const inputProps = { inputType: 'email', placeholder: 'Email' } satisfies ComponentProps<typeof TextInput>
export const linkProps = { to: { name: 'index' }, prefetchOn: 'interaction' } satisfies IUILinkProps
export const formProps = { errorsSectionProps: { title: 'Errors', dense: true } } satisfies IFormProps

export type ConsumerEditor = IComponent<typeof Tree>
export type ConsumerTree = ComponentExposed<typeof Tree>

// @ts-expect-error The public search value is a string.
export const invalidTreeSearch = { search: 123 } satisfies ComponentProps<typeof Tree>
// @ts-expect-error Component props retain the input-type union.
export const invalidInputType = { inputType: 'invalid' } satisfies ComponentProps<typeof TextInput>
// @ts-expect-error Error sections retain their actual public prop types.
export const invalidErrorSection = { errorsSectionProps: { dense: 'invalid' } } satisfies IFormProps
