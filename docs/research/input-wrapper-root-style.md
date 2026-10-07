# InputWrapper root-style hydration — I02

Rechecked on 2026-09-29 with the matched Vue 3.6.0-rc.9 runtime/compiler packages
and this repository's Nuxt Vapor preview. I02 remains open.

## Current result

Moving `wrapperStyleVariables` from `.wrapper__body` back to InputWrapper's
`.wrapper` root still crashes development hydration for an existing mixed
owner chain. The same change passes the native layout examples. The trial was
reverted; variables remain on the body alongside `contentStyle`.

After restoring the body binding, all 15 development checks passed: the three
prepend scenarios and two input-layout scenarios in each of Chromium, Firefox
and WebKit. This includes JavaScript-disabled SSR and localized layout links.
It verifies the retained workaround, not removal of I02.

The failing chain is the existing VDOM `InputPrependPreview` component owning
native Vapor TextInput, whose root is native Vapor InputWrapper. This is a
supported UI consumer case, not an adapter introduced for the investigation.

## Reproduce in this checkout

1. Temporarily add `:style="wrapperStyleVariables"` to InputWrapper's root
   `.wrapper` element in
   `packages/UI/app/components/InputWrapper/InputWrapper.vue`.
2. On the dynamic `.wrapper__body`, change
   `:style="[wrapperStyleVariables, contentStyle]"` to `:style="contentStyle"`.
3. Start the development server from the application root, with no other Nuxt
   build, typecheck or Vitest process writing the same `.nuxt` directory:

   ```sh
   bunx --no-install nuxt dev --host 127.0.0.1 --port 3020
   ```

4. In another terminal, run:

   ```sh
   E2E_BASE_URL=http://127.0.0.1:3020 bun run test:e2e \
     tests/e2e/vapor-input-layouts.spec.mjs tests/e2e/input-prepend.spec.mjs
   ```

5. On rc.9, both native layout tests pass, but all three prepend tests fail:
   `[data-testid="prepend-preview"]` stays at `data-ready="false"`. Loading
   `/cs-CZ` directly also exposes the browser error below. Server-rendered input
   HTML being present does not mean hydration completed.
6. Restore the original body binding after the experiment. Do not keep the
   root binding merely because the native examples or a production build pass.

Observed development stack (installed rc.9 runtime):

```text
TypeError: Cannot read properties of undefined (reading 'nodes')
  at normalizeBlock (runtime-vapor.esm-bundler.js:3326)
  at normalizeBlock (runtime-vapor.esm-bundler.js:3326)
  at resolveCssVars (runtime-vapor.esm-bundler.js:1658)
  at resolveCssVars (runtime-vapor.esm-bundler.js:1666)
  at styleHasMismatch (runtime-vapor.esm-bundler.js:1640)
```

## Upstream cause and status

The development style-mismatch checker calls `resolveCssVars` for a styled
root. That function recursively follows `instance.parent` without checking
whether the parent is a Vapor instance. Its `normalizeBlock(instance)` call
cannot normalize a VDOM component instance; the fallback attempts to read
fragment `nodes` and eventually receives undefined.

The native layout example has a surrounding section that breaks this
effective-root chain. Its passing result therefore does not establish mixed
owner compatibility. Moving our existing VDOM preview to Vapor would remove
that regression coverage while leaving external UI consumers exposed.

On the check date, [Vue's releases](https://github.com/vuejs/core/releases)
and npm's `rc` tag still point to 3.6.0-rc.9. The same unchecked parent traversal
is present in
[Vue's `minor` branch source](https://github.com/vuejs/core/blob/minor/packages/runtime-vapor/src/dom/prop.ts)
under `resolveCssVars`. This is an observation of the checked source, not a
claim that no upstream issue or proposed fix exists.

## Conditions for removal

Keep the workaround until a verified runtime fix supports the existing mixed
owner chain. Do not add a local Vue patch or renderer adapter. After a runtime
upgrade, repeat the development reproduction before deciding to restore the
root binding permanently.

Once hydration passes, verify regular, inline and label-inside layouts,
readonly/disabled/loading states, model updates, prepend changes, remounting
and JavaScript-disabled SSR in Chromium, Firefox and WebKit. Also verify that
marker and non-teleported `#menu` content inherit the root variables, including
updates, while `contentStyle` remains restricted to the body. Those wider
inheritance guarantees are not restored by the current workaround.
