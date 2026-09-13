# Code standards — reference

## Affected validation

Run affected lint, typechecks, and meaningful regression checks as part of the authorized change without repeated approval. Choose the smallest supported scope. Broaden checks for shared contracts, dependency/configuration changes, or evidence of wider impact. Fix new failures; report existing failures or missing dependencies, generated artifacts, credentials, and services as concrete blockers. Do not claim a check passed merely because its command exists. Add tests only for behavior that could regress; skip tests that restate implementation or mocks.

Use `bunx --no-install eslint <affected-files>` and `bun run typecheck` for affected TypeScript/Vue changes. Run focused `bun run test:run <test-file>` checks, `bun run test:tooling` for lint-tooling changes, and affected `bun run test:e2e <test-file>` scenarios for browser behavior; inspect Vitest/Playwright configuration for required setup.

---

## General (expanded)

- Formatters (`eslint` / Prettier) must be enabled for everything the team works on; this repo wires them through ESLint.
- If any **function**, **constant**, or **type** is used in **more than two** places, extract it to a reusable module—unless the extract is a **tiny** or **overengineered** helper with no domain meaning. Keep one-off logic next to its only caller.
- Add tests **sparsely**. Skip **vacuous** tests (they cannot fail for a real defect).
- Each **logical** section in **large** files (~200+ LoC) should be visibly separated, preferably with a short comment. Omit heavy segmentation in small components.
- Comments are **not** a narration of what the code does—they add **why**, edge cases, or context you cannot read from the code alone.
- Prefer utility libraries (`lodash-es`, VueUse, the Utilities layer) over hand-rolled helpers, **except** where ECMAScript already has a clear idiom (e.g. native `map`/`filter`—do not use lodash for those).
- Every change should aim for **readability**, **maintainability**, and **performance** together; **consistency** with neighboring code is the tie-breaker.

---

## Vue + TypeScript (expanded)

- SFC order: **script → template → style**.
- Prefer **CSS** (including Uno `@apply` in `<style>`) over **JS** for styling.
- **SSR** should work, or use **guards** so server render does not hit browser-only APIs.
- Prefer **TypeScript inferring** types; explicit types are fine when they help. **`any`** is discouraged; prefer **`unknown`** when a loose top type is needed.
- **Max three** function parameters (prefer two); beyond that use an **`options`** object.

### Wrong: too many positional args

```ts
function doSomething(
  arg1: boolean,
  arg2?: string,
  arg3?: number,
  arg4?: boolean,
) {
  // ...
}
```

### Correct: required args + options

```ts
function doSomething(
  arg1: boolean,
  options?: { arg2?: string; arg3?: number; arg4?: boolean },
) {
  // ...
}
```

### Uno attributify: max three attributes per tag

Multi-value props still count as **one** attribute (e.g. `flex="~ col gap-2"` → one).

**Preferred** (simple layout + color—three attributify attributes, no extra class):

```html
<div
  flex="~ col gap-2"
  bg="red"
  color="white"
>
  …
</div>
```

In real features, prefer **theme tokens** where the design system defines them (e.g. `bg="secondary"`, `color="ca"`) as in [`TableLayoutSelector.vue`](../../../packages/UI/app/components/Table/TableLayoutSelector.vue) and neighboring components.

**Wrong** (four+ separate attributify props):

```html
<div
  flex="~ col"
  color="blue"
  border="1 black"
  bg="red"
  font="rem-20"
>
  Something
</div>
```

**Correct** — use a class and `@apply`:

```html
<div class="custom-class">
  Something
</div>
```

```css
.custom-class {
  @apply flex flex-col color-blue border-1 border-black bg-red font-rem-20;
}
```

### `defineModel` for v-model

`defineModel` registers the prop and emit—do not duplicate the same name in `defineProps`.

```vue
<script setup lang="ts">
// Other props: defineProps<{ ... }>()

const model = defineModel<string | undefined>()
const title = defineModel<string>('title', { required: true })
</script>

<template>
  <div>
    <TextInput v-model="model" v-model:title="title" />
  </div>
</template>
```

Adjust names and types to match the component; prefer `defineModel` over manual `modelValue` + `update:modelValue` when suitable.

### i18n: literal keys with `$t`

When possible, pass the translation key as a **string literal** to `$t` so tooling can analyze **used/unused** keys.

**Wrong** (key only exists to feed `$t`):

```ts
const translationKey = 'general.key'
const translatedItem = $t(translationKey)
```

**Correct**:

```ts
const translatedKey = $t('general.key')
```

Use a variable only when the key is **dynamic** by design (e.g. computed from server data or a loop).

### `isNil` vs `!= null`

When checking whether a value is **set** (neither `null` nor `undefined`), use lodash-es **`isNil`** / **`!isNil`**. Do not use loose equality with `null`.

**Wrong**:

```ts
if (options.temperature != null) {
  settings.temperature = options.temperature
}
```

**Correct**:

```ts
import { isNil } from 'lodash-es'

if (!isNil(options.temperature)) {
  settings.temperature = options.temperature
}
```

In Nuxt apps, **`isNil`** may be auto-imported when neighboring code uses it without a local import; otherwise import from **`lodash-es`**. `isNil(value)` and `value == null` behave the same, but **`isNil`** reads clearly at the call site.

### Vue: shorthand props

When the prop name and the bound variable are the same, use **shorthand** (`:prop`).

**Wrong**:

```vue
<script setup lang="ts">
const user = ref({ id: 1, firstName: 'John', lastName: 'Doe' })
</script>

<template>
  <SomeComponent :user="user" />
</template>
```

**Correct**:

```vue
<script setup lang="ts">
const user = ref({ id: 1, firstName: 'John', lastName: 'Doe' })
</script>

<template>
  <SomeComponent :user />
</template>
```

## UI library and `ui` prop (examples)

### Prefer `packages/UI` over native controls

Use **`Btn`**, **`Field`**, **`Dialog`**, and other **`@gentl/ui`** components when they match the interaction. Raw `<button>`, `<input>`, etc. are for gaps where no UI primitive exists or the requirement cannot map cleanly.

**Wrong** (native button when `Btn` fits):

```vue
<template>
  <button
    type="button"
    class="btn-primary"
    @click="save"
  >
    {{ $t('general.save') }}
  </button>
</template>
```

**Correct**:

```vue
<template>
  <Btn
    :label="$t('general.save')"
    @click="save"
  />
</template>
```

### UI components: style with `ui`, not root `class` / `style`

Most UI components accept **`ui`** with `*Class` / `*Style` callbacks. Merge with **`defaults.all`** (or the payload your prop type documents) so you extend—not replace—theme defaults.

**Wrong** (trying to style inner pieces from the root):

```vue
<Btn
  label="Status"
  class="hidden md:flex font-rem-14"
/>
```

**Correct** — target the surface the component exposes (here, label):

```vue
<Btn
  label="Status"
  :ui="{ labelClass: ({ defaults }) => `${defaults.all} hidden md:flex font-rem-14` }"
/>
```

**Acceptable** — layout around the control (wrapper / parent), not fighting internal nodes:

```vue
<template>
  <div flex="~ justify-end gap-2">
    <Btn label="Cancel" />
    <Btn
      label="Save"
      preset="SAVE"
    />
  </div>
</template>
```

**Real usage in-repo** (same `labelClass` + `defaults` pattern): [`TableToolbar.vue`](../../../packages/UI/app/components/Table/TableToolbar.vue) (`Btn` with `:ui="{ labelClass: … }"`), and the component prop types for other supported surfaces.

---

## Git

- Pull requests and **master** commits: messages follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).
- Before merging to **master**: **squash** commits.
- **`rebase`** is generally preferred over **`merge`** (not a strict rule).

---

## ESLint (repo facts)

Root [eslint.config.mjs](../../../eslint.config.mjs) uses `@antfu/eslint-config` with Nuxt’s `createConfigForNuxt`, `stylistic: true`, `formatters: true`, `unocss: true`. Notable overrides include `vue/max-len` **120**, single quotes, `curly: all`, separate type imports, and `type` over `interface` for consistent type definitions. Unless the team changes config, treat these as required.

## Brace style (`brace-style`)

- Rule: **`@stylistic/brace-style: ["warn", "1tbs", { allowSingleLine: false }]`**.
  - `1tbs` = opening brace on same line as control statement. `} else {` on same line by default.

### Accepted exception

An **empty line** between `}` and `else` in if/else blocks is **intentional** when the two branches are long enough that a visual separator improves readability.

**Valid (exception):**

```ts
if (props.fetchMore) {
  // ...many lines of logic...
  nextTick(() => {
    rerenderVisibleRows({ triggerScrollEvent: true, emitScrollEvent: false })
  })
}

// Empty line + comment above `else` is allowed
else {
  // ...many lines of logic...
}
```

**Standard (no separator, preferred for short branches):**

```ts
if (a > b) {
  doThing()
} else {
  doOther()
}
```

**Rationale:** Long if/else chains with substantial logic in each branch benefit from vertical breathing room. The `brace-style` rule cannot be configured to allow this, so the warning is accepted and documented rather than suppressed inline.

### General principles

- **Curly braces required** for all control structures (`curly: ["warn", "all"]`). No single-line bodies without braces.
- **Prefer readability over strict lint compliance** when the rule lacks configuration hooks. Document the exception.


## Abstractions

Keep one-off logic **near** its only caller. A slightly larger function beats a tiny helper that exists only to be called once and carries no domain meaning.

Extract when the hop earns its keep: real reuse, or a name the reader must hold as its own concept. A one-line wrapper next to a complex function is **indirection**, not design.

**Wrong** (tiny helper with no value):

```ts
function adjustValue(payload) {
  return payload ? true : false
}

function complexFunction() {
  const adjustedValue = adjustValue(...)
}
```

**Correct** — inline it, even if `complexFunction` grows a little:

```ts
function complexFunction() {
  const adjustedValue = payload ? true : false
}
```
