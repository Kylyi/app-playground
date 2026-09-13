# Nuxt Vapor verification — 2026-09-05

Based on Daniel Roe's [nuxt-vapor-demo](https://github.com/danielroe/nuxt-vapor-demo),
specifically its [package.json](https://github.com/danielroe/nuxt-vapor-demo/blob/main/package.json)
and [Nuxt config](https://github.com/danielroe/nuxt-vapor-demo/blob/main/nuxt.config.ts).

## Configuration

- Nuxt preview: `https://pkg.pr.new/nuxt@35772`, as used by the demo.
  Its package/banner reports `4.5.0`; this is the Vapor integration preview,
  not the stable npm release of that version. Keep the Bun lockfile.
- Vue: `3.6.0-rc.7`, replacing the older Vue commit snapshot used in the demo.
- `vue: { vapor: true }` enables Nuxt's client interop plugin and component imports.
- Root overrides keep Vue runtime/compiler packages on the same RC. Without
  them, Nuxt's stable dependency range installs Vue 3.5 alongside the direct RC,
  and the compiler can silently continue generating VDOM components.
- The app uses `ssr: true`. The smoke test verifies server rendering and client hydration.

## Verification

Start development server:

```sh
bunx --no-install nuxt dev --host 127.0.0.1 --port 3011
node scripts/test-vapor.mjs http://127.0.0.1:3011
```

The smoke test uses Playwright-managed Chromium; install it with `bunx --no-install playwright install chromium`. `/vapor` is a VDOM
page containing a `<script setup vapor>` component, which contains the existing
VDOM UI Badge. It verifies:

- Server HTML contains the component, scoped slot and Badge with JavaScript disabled.
- Client hydration completes without hydration warnings or browser errors.
- `getCurrentInstance()` is null in the client Vapor component.
- Parent props, computed state, child events and input `v-model` update.
- VDOM scoped slot content and the UI Badge update across the interop boundary.
- Unmount/remount resets local state and retains parent state.
- No browser page errors or console errors are emitted.

The dev-served `/_nuxt/components/VaporProbe.vue` contains `defineVaporComponent`;
the marker is therefore compiled, not merely present in the source.

The server renderer provides an instance during setup even for this Vapor SFC.
Rendering the raw instance diagnostic produced `yes` on the server and `no` on
the client, causing a hydration mismatch. The probe now starts with the same
`pending` diagnostic on both sides and publishes the client runtime in `onMounted`.
The actual counter, slot and Badge content remain server-rendered. The browser
test waits for this mounted signal before interacting, rather than treating the
presence of server HTML as evidence that hydration has completed.

Production verification:

```sh
bunx --no-install nuxt build
PORT=3012 HOST=127.0.0.1 node .output/server/index.mjs
node scripts/test-vapor.mjs http://127.0.0.1:3012
```

Use the direct build command here because the existing `build` script references
`gen:icon-collections`, which is not defined in this playground.

Vue 3.6 broadens the parent instance type. `getComponentName` now accepts only
the component name metadata it needs instead of requiring a complete VDOM
instance. This is a typing adjustment, not a replacement for the model and
DOM ref migration identified in the earlier audit.

This smoke test does not certify all Utilities/UI components. In particular,
the existing Vapor marker in `Pivot.vue` now becomes active: its store models have since been migrated to the new `initRef`, but its
rendering, filter focus hooks and descendants still need verification. See the
[current migration checklist](../vapor-migration.md).
The VDOM runtime remains present because this is an interop Nuxt application.

Upstream references: [Nuxt 4.x preview](https://github.com/nuxt/nuxt/pull/35772),
[integration PR](https://github.com/nuxt/nuxt/pull/35759),
[Vue RC.7](https://github.com/vuejs/core/releases/tag/v3.6.0-rc.7).

The script now delegates to Playwright Test. See [testing commands and coverage](../testing.md).
