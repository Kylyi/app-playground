# Selector: Vapor migration with store-owned models

`Selector.vue` retains `withDefaults(defineProps<ISelectorProps>(), …getComponentProps)`
and passes those props into `useSelectorStore({ props })`. The store creates models with `initRef({ props, propName, defaultValue? })`,
which delegates synchronization to Vue `useModel`.
There are no Selector `defineModel` declarations or component-level model/default adapters.

## Ownership and behavior

Create the store synchronously during the owning component's setup. Vue's
`useModel` captures that owner and implements controlled/local behavior and
`update:*` emits for both VDOM and Vapor in the pinned Vue 3.6 RC. Descendants
inject the existing store. Do not defer model creation into an event callback
or let a descendant initialize models from its parent's props.

The owner must declare all model props and their update events. `useModel`
does not generate declarations as `defineModel` does. A prop with its update
listener is controlled; an omitted binding allows local updates. Null remains
explicit, while undefined follows Vue prop defaults. Initial defaults do not
emit to the parent. Standalone stores without props retain local refs.

`optionKey` and `initialMap` are read-only reactive inputs. The option lookup
copies `initialMap` instead of adding entries to the parent's object. Models
remain refs in the store; raw component props are not expected to mirror local
uncontrolled model writes.

## Configuration

The existing config authoring format, `getComponentProps`, and
`getComponentMergedProps` remain in use. The component consumes `mergedProps`
for UI callbacks and nested overrides, using the existing shallow merge policy.

The generated object/array default factories now clone configured values per
instance. Previously they returned the same object, which could let one owner's
local model mutation affect another owner. Functions inside configuration remain
functions; the test verifies default UI callbacks survive partial overrides.
Selector's added-items and loading defaults live alongside its other config.

## Renderer boundary

Selector is Vapor; Field, SelectorInner, SelectorMenu and other descendants
still use VDOM interop. Field/InputWrapper expose explicit root/control APIs,
and List exposes its root for menu sizing and focus. This does not remove VDOM
from the application or certify every UI component.

Vite deduplicates Vue runtime/shared packages: separate copies of `@vue/shared`
previously caused `useTemplateRef` to compare different empty-object sentinels
and fail during setup. Optional slots are forwarded only when supplied, avoiding
empty menu rows across the Vapor/VDOM boundary.

## Verification

`/selector-vapor` and Playwright cover parent updates, null/undefined, exposed
clear, local models, actual option selection, search, keyboard focus, custom
keys/slots, a Vapor parent, remount, and SSR without JavaScript. The initial two
scenarios also passed against the original VDOM Selector before migration.

`component-props.spec.ts` exercises store-owned local models and owner emits,
independent configured array defaults, and reactive partial UI overrides.
Run the commands in [testing.md](../testing.md). Typecheck is opt-in under the
project's conventions.

Use the pinned Vue/Nuxt versions in [nuxt-vapor.md](nuxt-vapor.md); repeat the
matrix after upgrades. Development still logs existing ResizeObserver and List
emit warnings. Async loading, multi-select chips, responsive menu/dialog
switching and other browsers remain future coverage.

## initRef wrapper contract

With props and no `instance` property, `initRef` calls `useModel` during the
owner's setup. Without props it creates a local ref. The key/value types are
inferred from props. The owner still declares model props and update emits.

`defaultValue` is a read fallback whenever the model is undefined, including
later resets. It does not emit an initial update or replace null. Object/array
fallbacks are cloned once per wrapper; function values remain callable values.
This deliberately replaces the old first-tick fallback behavior.

`initWith.condition` and `initWith.fnc` receive props and the prop name. When the
condition matches, the result is written through the ref: controlled models emit
and await the parent's response; local models update immediately. Initialization
also works without props. Do not expect a controlled initialization to silently
change the parent's state.

An explicitly present `instance` property selects the unchanged legacy
implementation in `init-ref-legacy.ts`, even if its value is null or undefined.
Existing call sites keep their behavior; migrate them individually by removing
that property after declaring the required model props/emits. The legacy path
continues to rely on VDOM internals and must not be used in Vapor components.

`init-ref.spec.ts` tests fallback/reset semantics, explicit initialization,
controlled emits, local isolation, function defaults and legacy dispatch.

## Remaining initRef callers migrated

Form, List, Tree, TreeDms, Pivot, QueryBuilder and Menu now initialize their
models from props without passing a component instance. Owners declare the
corresponding update events. SelectorMenu binds List's `loading` model using
its declared prop name. Tree resets no longer fall back to the original prop
snapshot. Non-model renderer dependencies remain outside this change.

The legacy overload remains for external Utilities consumers, but no production
caller in this checkout uses it. Store contract tests cover controlled and
one-way updates for all seven migrated stores.
