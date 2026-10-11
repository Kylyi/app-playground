# InputWrapper root-style hydration — I02

Resolved on 2026-10-11 with Nuxt 4.6.1 and matched Vue 3.6.0-rc.11
runtime/compiler packages. The CSS variable workaround and component TODO
are removed.

## Current contract

`wrapperStyleVariables` binds to InputWrapper's original `.wrapper` root.
`contentStyle` stays on the dynamic `.wrapper__body`. Root markers and
non-teleported `#menu` content inherit the variables again, including live
radius changes; body-only content variables do not leak onto the root.

The existing VDOM `InputPrependPreview` owning native TextInput → InputWrapper
is retained. Native regular/inline/label-inside examples cover focus, model
updates, readonly/disabled/loading, remounting, server HTML without JavaScript
and localized links. The style checks include both a TextInput marker and a
direct InputWrapper with menu content.

WebKit's ResizeObserver delivery exposed a separate one-frame label shift when
the prepend slot disappeared. InputWrapperRegular now measures after slot
updates as well as through its existing observer. No new observer or renderer
adapter is introduced; animation-frame readiness and disposal remain owned by
the component.

## Historical defect and upstream fix

On Vue RC.9, restoring the variables to the root crashed development hydration
in the mixed owner chain. `resolveCssVars` followed an effective-root chain
into a VDOM parent and passed that instance to Vapor's `normalizeBlock`, which
read undefined fragment `nodes`. Native-only layout examples passed because
their surrounding section broke that chain, so they could not prove external
VDOM consumer compatibility.

Vue RC.10 fixes the parent traversal in
[#15721](https://github.com/vuejs/core/pull/15721); the matched RC.11 upgrade
includes that fix. We retested the original mixed owner rather than changing
its renderer. No local runtime patch is needed.

## Regression commands

Run from the application root with a development server and no concurrent Nuxt
build, typecheck or Vitest process writing its generated directory:

```sh
bunx --no-install nuxt dev --host=127.0.0.1 --port=3020
```

In another terminal:

```sh
E2E_BASE_URL=http://127.0.0.1:3020 bun run test:e2e \
  tests/e2e/input-prepend.spec.mjs \
  tests/e2e/vapor-input-layouts.spec.mjs
```

Repeat in Chromium, Firefox and WebKit when changing the runtime or style
ownership. Hydration readiness and browser warnings must remain checked;
server markup or a passing production build alone would have missed RC.9's
development failure.
