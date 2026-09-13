# Frontend conventions

## UI library (`packages/UI`, `@gentl/ui`)

- **Strongly prefer components from the UI library** over raw HTML elements when there is a matching primitive (buttons, inputs, dialogs, lists, chips, form fields, layout helpers, etc.). Components live under [`packages/UI/app/components`](../../../packages/UI/app/components); they are registered for Nuxt apps that use the UI layer—use the same names you see in neighboring features (often `Btn`, `Field`, `Dialog`, and similar).
- **Reach for UI first**, then fall back to native markup only when no suitable component exists or the UI team’s component would fight the requirement (rare). This keeps accessibility, theming, and behavior consistent across the product.

### Styling UI components: the `ui` prop

- **Most UI components expose a `ui` prop** (see prop types under each component’s `types/` folder, e.g. [`btn-props.type.ts`](../../../packages/UI/app/components/Button/types/btn-props.type.ts)) for **visual overrides**: nested `*Class` / `*Style` callbacks such as `containerClass`, `labelClass`, `iconClass`, etc., merged with defaults via `getComponentMergedProps` / layer config ([`packages/UI/app/config.ts`](../../../packages/UI/app/config.ts)).
- **Prefer `:ui="…"` for those overrides** instead of slapping **`class` or `style` on the component root** to restyle internals you do not control. Root `class`/`style` may not target the right node or may fight internal structure; `ui` is the supported extension point.
- **Exception**: when you only need a **layout wrapper** (e.g. flex/grid on an outer shell) and the component has no relevant `ui` override key, a **wrapper element** or **attributify/class on a parent** is fine—still avoid ad hoc root styling on the UI component when `ui` can express it.

**Example snippets** (wrong vs correct, plus a wrapper pattern): [reference.md — UI library and `ui` prop (examples)](reference.md#ui-library-and-ui-prop-examples).


## Vue SFCs

- Block order: **`<script>` → `<template>` → `<style>`** (commonly `script setup lang="ts"`, then template, then `style` often `lang="scss"` + `scoped`).
- Prefer **CSS (and `@apply`) over JS** for styling when practical. For **`packages/UI` components**, prefer the **`ui` prop** for component-owned surfaces (see [Styling UI components](#styling-ui-components-the-ui-prop)); use scoped CSS / Uno on wrappers or non-UI markup as usual.
- **SSR**: Nuxt SSR is the default; support it or guard browser-only APIs so SSR does not throw.
- Prefer **`defineModel`** for two-way bindings (see [reference.md](reference.md) for pattern).
- Prefer **shorthand props** when the variable name matches the prop: `:user` instead of `:user="user"` (see [reference.md](reference.md)).


## Internationalization (i18n)

- Prefer **literal keys** in **`$t('…')`** so static analysis can track **used/unused** keys. Avoid assigning the key to a variable only to pass it into `$t`, except when the key is **genuinely dynamic** (see [reference.md](reference.md)).


## Nuxt autoimports

- Nuxt **auto-imports** composables, many Vue APIs, and other registered symbols. When writing or generating code, **check whether a symbol is already auto-imported** (e.g. generated typings under `.nuxt`, layer `imports` config, or the same symbol used without a local import in nearby files).
- If a symbol is available via autoimports, **use it without a redundant explicit import**. Prefer matching how the **same layer or directory** already resolves the symbol.
- **Nuxt layers** can **extend or change** what is auto-imported; do not assume only the root app’s defaults. When in doubt, follow **neighboring code** in that layer/component.
- **Types** may still need explicit **`import type`** where ESLint expects it (see the TypeScript rules in [SKILL.md](SKILL.md)); prefer dropping redundant **value** imports when Nuxt already provides the symbol.


## UnoCSS attributify

- **Prefer attributify** on plain markup (layout wrappers, shells, non-`@gentl/ui` containers) when styling stays **simple**: a few utilities and **at most 3 attributify attributes per element**. That is usually better than a one-off named **`class`** for the same small set of rules—unless the exact bundle is reused widely (then a shared class or component is clearer).
- **Count attributes, not utilities**: one HTML attribute is one slot. Bundling is encouraged—e.g. `flex="~ col gap-2 items-center"` is **one** attributify attribute (this pattern appears across `packages/UI`, widgets, and `app/components`).
- **Over the limit**: if you need a fourth attributify attribute (or the template becomes hard to scan), use a **`class`** and **`@apply`** in scoped `<style>` instead. Examples: [reference.md — Uno attributify](reference.md#uno-attributify-max-three-attributes-per-tag).
- **Keep utility namespace and attribute namespace aligned**: do not embed another utility prefix inside an attributify value. Example: use `font="rem-11"` (and `text="caption"` when needed), **not** `text="font-rem-11"`.
- **Do not mix style systems on one element**: if an element has a styling `class`, move all styling utilities for that element into the class (`@apply`) instead of keeping extra attributify style attributes beside it. Pick one style source per element for readability and maintainability.
- **One selector, one `@apply`**: when using scoped classes, keep a single `@apply` declaration per selector and group all utilities there.
- **Avoid overlapping semantic classes for different variants**: if two cards/blocks diverge in layout or responsibilities, define separate classes (for example, `*-stat-card` vs `*-day-card`) rather than stacking a shared base plus per-variant overrides that fight each other.
