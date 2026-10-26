# Nuxt Vapor verification

The 2026-10-12 follow-up fixes Tree HY01, removes asynchronous Pivot setup,
checks a standalone native consumer and clears the production type diagnostics.
See the [current validation record](../testing.md) and the
[native dependency/cleanup audit](native-vapor-audit.md). The dated upgrade
snapshot below preserves the results and remaining issues at that time.

## Released integration snapshot — 2026-10-11

The application and reusable layers now use released Nuxt **4.6.1**, replacing
the `pkg.pr.new` integration preview. Vue and all compiler/runtime overrides are
matched at **3.6.0-rc.11**; Nuxt Test Utils is **4.3.3**. Keep `vue.vapor: true`,
SSR, the matched Vue overrides and Vite deduplication: Nuxt's stable Vue range
does not select the prerelease runtime, and shared renderer sentinels require
one runtime graph.

[Nuxt 4.6](https://github.com/nuxt/nuxt/releases/tag/v4.6.0) supports Vapor
components through interop; the application root still uses VDOM. This upgrade
does not close the migration's native-only bundle requirement. The existing
Nuxt 5 compatibility settings now enable typed routes. Localized arbitrary
paths use `{ path }` targets, and reusable UI uses generic router targets to
avoid expanding a consuming application's generated route union.

Vue RC.11 includes the RC.10 fixes for mixed-owner CSS variable hydration and
empty forwarded native slots. InputWrapper's variables have returned to its
root, and the empty-slot probe no longer has an expected-failure annotation.
VirtualScroller's extra `display: contents` root is removed. The separate Tree
initial-data mismatch remains tracked in HY01.

Vapor templates now compile unknown identifiers as props. Nuxt's template
autoimport addon only recognizes VDOM `_ctx` lookups, so helpers used only in
native templates have explicit imports. Script autoimports remain available.
The audit covered all 314 application/layer Vapor SFCs and found ten affected
files; picker, Chip, notification, file-preview and TreeDms regressions exercise
those bindings.

The broken icon-generator build command, missing monorepo script target, unused
`vue-imask` dependency and obsolete Vitest environment-export alias are removed.
UI's orphaned Playwright config/scripts referenced a deleted `e2e/fixtures/app`;
they and its unused Playwright development dependencies are removed. Browser
tooling continues from this application root, as required by AGENTS.md.
`bun run build` now runs the production build directly. Icon server collections
remain explicitly empty: the UI's UnoCSS icon assets do not need every installed
Iconify collection embedded into Nitro. Vue ESM test aliases, inlined consumers
and the client test-mode define remain necessary; removing them broke real
component/model tests. See [testing](../testing.md) and the
[migration checklist](../vapor-migration.md) for validation and remaining work.

The browser sweep also caught FilePreview2 allocating local image/video URLs
without revoking them. It now owns one VueUse object URL, releases it on file
replacement and scope disposal, and closes an open preview when the file changes.
The existing browser regression checks URL creation/revocation and dialog cleanup.

The floating-target diagnostic's alternate offset uses a scoped class, because
the shared native-control margin reset overrides its UnoCSS attributify margin.
The position-change assertion remains in place and still verifies live retargeting.
QueryBuilder's first-condition check counts the editor itself, because editor
autofocus can also open the nested field selector. It still requires every menu
and drag ghost to disappear when the owning inline builder is removed/cancelled.

Development cleanup checks pass in all three browser engines: 57 functional
cases plus three expected HY01 failures, one per engine (60 reporter passes).
Both empty-slot probe variants pass normally. This includes the mixed
VirtualScroller owner, original VDOM prepend chain and native style inheritance.

Frozen-lockfile installation and all 306 unit tests across 52 files pass.
Affected lint passes. Typecheck retains the same 39 baseline diagnostics, with
the same file/error-code distribution; only the existing AsyncMarkdownRow
serialization diagnostic's wording changes with Nuxt's updated types.

The production Chromium sweep contains 251 cases. All 250 functional cases pass
across the full sweep and targeted repairs; Tree's initial-data HY01 remains one
expected failure. After the final rebuild, the floating-target and QueryBuilder
suites pass all eight cases. See [validation details](../testing.md#historical-nuxt-46-upgrade-validation--2026-10-11).

Upstream: [Nuxt 4.6.1](https://github.com/nuxt/nuxt/releases/tag/v4.6.1),
[Vue RC.11](https://github.com/vuejs/core/releases/tag/v3.6.0-rc.11),
[Test Utils 4.3.3](https://github.com/nuxt/test-utils/releases/tag/v4.3.3).

## Historical preview pilot — 2026-09-05

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

At the time of this pilot, `build` referenced a missing `gen:icon-collections`
script. The released integration above removes that stale command.

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
