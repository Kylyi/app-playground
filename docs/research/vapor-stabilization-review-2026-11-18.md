# Vapor 2.3 stabilization review

The initial review found five release blockers involving layer selection, production icons, signed currency entry, saved Table preferences, and overlay ownership. The findings below describe the reviewed commits.

The initial review covered playground `6415c1d`, UI `1c9d3a74`, and Utilities `ab7aebb`. Those layer commits included the November 18 `2.3` heads, `e636e9ef` and `2f6e299`. The migration changed 405 files in UI and 20 in Utilities relative to those heads.

## Stabilization follow-up on November 19

The UI release branches received only the CurrencyInput and overlay fixes. Browser tests exercised each branch's production build with signed keystrokes, a real clipboard paste over selected text, and a legacy VDOM owner with a second overlay open.

| UI branch | Commit | Result of entering `1234` |
| --- | --- | --- |
| `v2.1` | `f0f2f616` | `12.34` |
| `2.3` | `3fc958e8` | `1234` |
| `2.3-mono` | `ab38f736` | `1234` |

The Vapor layers use Nuxt 4.6.4, Vue 3.6.0-rc.15, VueUse 15.0.0, and Vue Virtual 3.13.52. The playground and UI fallbacks pin their GitHub dependencies to reviewed commits. A clean playground with empty submodule directories built both remote layers and published all 150 referenced icons. A separate native build overlapped its typecheck and published all 149 referenced icons.

Table now recovers the 2.3 key for an omitted storage key. The adapter reads the immediate parent's name once during setup. Vue 3.6's shared active instance is an internal runtime export. The native and VDOM owner tests cover it for future Vue upgrades. A hidden element preserves the scroller slot during hydration when a Table starts without columns. The release-candidate ripple directives retain their element cleanup so Firefox cancels animations as soon as a control is removed.

The Vapor fixes also restore the existing dialog, link, Table autofit, and Utilities APIs. `useRefReset` now copies nested values at save time and applies a draft transform once per refresh.

Seven focused browser checks passed against the final production build, one worker at a time. Chromium covered signed currency, overlay ownership, autofit, and saved Table state. Firefox covered saved Table state, ripple cleanup, and Tree drag. Two results from the interrupted run remain unverified on this build. Firefox measured 100.38 ms against the QueryBuilder drag threshold of 100 ms, and the fullscreen Table pagination test timed out.

## Release blockers

### The remote UI layer selects incompatible Utilities

UI selects `github:gentlsro/Utilities#2.3` when it has no sibling Utilities checkout. A clean production build with that exact Utilities commit fails to resolve `useRafTask`. List and Tree also require `searchDataSync` and `sortDataSync`, which that revision lacks. The playground's own fallback selects UI `2.3`. Publish the compatible pair, point the fallbacks at those revisions, and build a consumer without sibling checkouts. [UI layer](../../packages/UI/nuxt.config.ts#L19) · [Playground layer](../../nuxt.config.ts#L13) · [Direct UI import](../../packages/UI/app/components/Table/composables/useTableColumnResizing.ts#L1)

### Parallel Nuxt commands can remove production icons

Each Nuxt setup clears the shared manifest. The production hook then deletes every SVG absent from that manifest. When the native typecheck ran during the build, the output referenced 149 SVG files and contained 108. The browser received 404 responses for missing icons. This caused 48 failures in the first native browser run.

A clean serial build and a subsequent serial rebuild both supplied all 149. Give each build its own manifest. Let the build that owns the output publish and prune it. Check every emitted icon URL in the final artifact. [Manifest reset and prune](../../packages/UI/modules/icon-assets/index.ts#L19) · [Per-process write cache](../../packages/UI/modules/icon-assets/processor.ts#L92)

### Currency input reverses negative amounts

In the production Czech playground, both keystrokes and a real clipboard paste of `-37,50` produced `37.5` in the model. Likewise, `-0,25` produced `0.25`. The minus handler writes negative zero into IMask. The next digit sees a positive sign. The signed-input algorithm also exists on `2.3`.

Preserve the entered sign until the first nonzero digit. Cover both input methods, fractions below one, and replacement of a selected amount. [Currency input handler](../../packages/UI/app/components/Inputs/CurrencyInput/CurrencyInput.vue#L177)

### Tables no longer load saved preferences when the caller omits the key

On `2.3`, a Table under a named parent used the parent name as its default storage key. Explicit `null` disabled persistence. Vapor treats an omitted key as `null` and uses an in-memory ref. Existing layouts, column settings, and queries disappear from the UI on upgrade, although the old browser data still exists.

The consumer scan found 374 of 391 Table declarations without an explicit key. Wrappers and prop spreads can still supply one. Give affected consumers their previous key through their wrapper or a compatibility adapter. Verify with a prepopulated 2.3 storage entry and a reload. Preserve the explicit `null` case. [Table initialization](../../packages/UI/app/components/Table/Table.vue#L54) · [Storage selection](../../packages/UI/app/components/Table/stores/table.store.ts#L268)

### Legacy overlay callbacks can close a different overlay

With two open overlays, the same `$hide({ instance })` call closed its owner on `2.3` and its sibling on Vapor. The new helper ignores the old option and selects the last overlay. An explicit DOM `target` still closes the correct owner. The scan found 356 legacy call or review locations, including applications with local helper copies. Preserve the VDOM adapter for consumers or migrate their calls to DOM targets before rollout. [Overlay selection](../../packages/UI/app/utils/hide.ts#L81)

## Other behavior and API findings

- **Editable drafts can mutate their origin after Save.** `useRefReset` copies nested references into the origin during `syncToOrigin`. After a commit of `{ child: { n: 2 } }`, a draft edit to `3` immediately changed the origin to `3`. A commit to `ref(null)` also throws in `Object.assign`. Copy nested values at the commit boundary and choose the update method from the current origin. QueryBuilder and Table use this helper. Both defects also exist in 2.3. [Commit path](../../packages/Utilities/app/composables/useRefReset.ts#L37) · [QueryBuilder consumer](../../packages/UI/app/components/QueryBuilder/QueryBuilderItemInline.vue#L46)
- **A refresh can apply a draft transform twice.** With `modifyFnc: x => x + 1`, an origin of `1` starts at `2`. Refresh from an origin of `4` produces `6`. Store the raw snapshot and transform it once. The consumer scan found 410 calls that specify `modifyFnc`. Idempotent transforms conceal this inherited defect. [Snapshot write](../../packages/Utilities/app/composables/useRefReset.ts#L61) · [Transform on reset](../../packages/Utilities/app/composables/useRefReset.ts#L97)
- **The standalone native app omits the ripple plugin.** Its root had eight marked elements. A trusted click on an enabled button started zero ripple animations. Install the plugin in the native entry. Its document listener also needs an app-owned disposer for apps that remount in the same document. Firefox retained the active animation on a detached element until its 800 ms duration elapsed. The existing immediate-disposal assertion failed. The fixture labelled VDOM now uses a Vapor `Btn`. Cover an actual VDOM owner and a native root. [Native bootstrap](../../tooling/native-consumer/entry.mjs#L29) · [Ripple lifecycle](../../packages/UI/app/directives/ripple.directive.ts#L44) · [Test fixture](../../app/components/testing/VaporRipple.vue#L34)
- **Link option types and runtime disagree after the sync.** Utilities declares `navigateToOptions.target` and `.rel`. UI ignores both. The previous Vapor revision read them. A caller can request a new tab and get same-tab navigation. Restore the option fallbacks after direct anchor props and test the anchor attributes and click. [Option types](../../packages/Utilities/app/types/navigate-to.type.ts#L28) · [Link target](../../packages/UI/app/components/Link/composables/useUILink.ts#L37) · [Anchor attributes](../../packages/UI/app/components/Link/composables/useUILink.ts#L101)
- **The descriptor type accepts functional components that the implementation invokes as resolvers.** An ordinary Vue functional component that reads `props.label` throws inside `createComponent` before mount. Preserve the existing resolver syntax. Add an unambiguous way to pass a callable component, and ensure that the overloads describe the supported forms. [Descriptor overloads and dispatch](../../packages/UI/app/utils/create-component.ts#L45)
- **Other 2.3 APIs require consumer decisions.** Direct callers of `TableColumn.autoFit` now need a `measurements` object. A call with the old payload throws. Utilities removes the documented `useZodOld` export. The newer `useZod` depends on UI. `useRefReset` replaces `emitName` with an explicit callback. The scan found eight older `useDialogLayout` calls that lack its new host getter. Preserve an adapter for each supported contract or update its callers before they adopt the layer. [Table API](../../packages/UI/app/components/Table/models/table-column.model.ts#L488) · [Utilities API](../../packages/Utilities/docs/en-US/reference/api.md#L249) · [Dialog API](../../packages/UI/app/components/Dialog/functions/useDialogLayout.ts#L7)

## Framework and package changes

**Vue and Nuxt.** The playground pins Vue `3.6.0-rc.11` and Nuxt `4.6.1`. On November 18, the current Vapor release candidate was `3.6.0-rc.15`. The stable Vue tag was `3.5.45`.

The newer candidate fixes SSR computed retention, hydration of empty slot ranges, forwarded slot attributes, and directive and KeepAlive cleanup. Nuxt 4.6.2 updates Vapor slot detection. Nuxt 4.6.4 fixes eight security advisories and includes Nitro 2.13.6 with three more fixes. Update all pinned Vue compiler and runtime packages together. [Vue changelog](https://github.com/vuejs/core/blob/v3.6.0-rc.15/CHANGELOG.md) · [Nuxt slot detection](https://github.com/nuxt/nuxt/pull/36614) · [Nuxt 4.6.4](https://github.com/nuxt/nuxt/releases/tag/v4.6.4)

**Nuxt upgrade prerequisite.** With the current compatibility version of 5, the first trial lost server autoimports. App typecheck failed on H3 and Nitro helpers. The native production build also failed because Nuxt Image imported `useRuntimeConfig` from `#imports`.

The trial app set `experimental.nitroAutoImports: true`. This restored server autoimports. Both typechecks, both production builds, all 462 unit tests, 37 native Chromium tests, and 29 mixed-renderer Chromium tests passed on the candidate stack. The browser cases included SSR, slot lifecycles, links, masks, and Table measurement. [Nuxt autoimport change](https://github.com/nuxt/nuxt/pull/36548)

**VueUse.** All 462 unit tests passed with the four direct packages at 15.0.0, up from 14.4.0. Both typechecks failed at the two month selectors. Version 15 ignores the former `useNow({ interval })` option and defaults to an animation frame. An explicit `scheduler` with `useIntervalFn` preserves the 15-minute interval. Both typechecks passed with that change.

Version 15 also changes the default trailing throttle call. The form store already specifies both flags. The resize observer now skips comment nodes. Components that measure or scroll an element still need an explicit DOM ref. [VueUse 15](https://github.com/vueuse/vueuse/releases/tag/v15.0.0) · [useNow implementation](https://github.com/vueuse/vueuse/blob/v15.0.0/packages/core/useNow/index.ts) · [MonthSelector](../../packages/UI/app/components/MonthSelector/MonthSelector.vue#L27) · [MonthSelectorGrid](../../packages/UI/app/components/MonthSelector/MonthSelectorGrid.vue#L27)

**Vue Router and Pinia.** The root resolves Router 5.3.1. Router 5.5.1 adds link APIs for its experimental router. The upstream native Vapor RouterView and RouterLink proposal remained open. Retain the public `useLink` adapter. [Router release](https://github.com/vuejs/router/releases/tag/v5.5.1) · [Vapor router proposal](https://github.com/vuejs/router/pull/2509)

Pinia 4.1.0 fixes object patches on shallow refs and resolves default store directories per Nuxt layer. The playground tests Pinia 4.0.3, while the UI manifest specifies 3.0.4. Verify or align the dependency versions for standalone consumers. [Pinia release](https://github.com/vuejs/pinia/releases/tag/v4.1.0)

**Virtual lists.** The root pins TanStack Vue Virtual 3.13.36 with core 3.17.8. Vue Virtual 3.13.52 uses core 3.19.11. Upstream corrected the visible range after a list shrinks and the offsets for programmatic scroll after row measurements change. A separate production build with this update passed 46 Chromium tests across virtual scrollers, Tree, Table, Pivot, and related initialization paths. [Visible range](https://github.com/TanStack/virtual/pull/1351) · [Scroll offsets](https://github.com/TanStack/virtual/pull/1363)

**Icons and other integrations.** Nuxt Icon 2.6.3 replaces its own per-instance async-data calls with payload reuse. UI has a separate icon implementation. Nuxt Icon 2.6.0 also changes the base directory for a layer's relative custom collections. Check custom icons in a consumer before the update from 2.5.1. [Nuxt Icon 2.6.3](https://github.com/nuxt/icon/releases/tag/v2.6.3) · [Nuxt Icon 2.6.0](https://github.com/nuxt/icon/releases/tag/v2.6.0)

The root already uses the latest Floating UI DOM and Vue packages, IMask, PerfectScrollbar, SortableJS, and Dragdoll. Vue language tools 3.3.14 fixes generic slot inference. That change is relevant to the typed Table and Pivot slots on 3.3.11. [Vue language tools](https://github.com/vuejs/language-tools/releases/tag/v3.3.14)

Vue Test Utils 2.6.0 changes how mounted components receive plain object and array props. For tests that depend on deep reactivity, pass reactive data or replace the prop. Keep this test harness update separate from the Vue runtime change. [Vue Test Utils release](https://github.com/vuejs/test-utils/releases/tag/v2.6.0)

## Simplifications with evidence

- DateTimeFullInput can call `mask.updateCursor()` directly. The adapter exposes a shallow-readonly ref around a shallow ref. Its value retains the original IMask instance. The extra `toRaw` and its comment describe an older ownership model. [Mask adapter](../../packages/UI/app/components/Inputs/functions/useInputMask.ts#L163) · [Cursor update](../../packages/UI/app/components/Inputs/DateTimeFullInput/DateTimeFullInput.vue#L215)
- The Vapor-owned Button and Chip roots can bind `data-ripple` declaratively. This removes their per-element directive effect and leaves the public directives available to existing templates. Verify the marker in server HTML and one animation per trusted click after remount. [Ripple directives](../../packages/UI/app/directives/ripple.directive.ts#L59)
- Table autofit can iterate the sample with its index and await each measurement. The current loop calls `rows.indexOf(row)` once for each row. With the same row object at two positions, both cell slots received index zero. Carry the index with the longest row in that branch as well. [Autofit loop](../../packages/UI/app/components/Table/models/table-column.model.ts#L555)
- Keep the runtime icon teardown scopes. In a separate RC.15 and Nuxt 4.6.4 build, direct `useAsyncData` still displayed the icons. After garbage collection, the DOM node count grew from 3,964 at ten remounts to 7,144 at thirty. Two independent repetitions produced the same counts. The control passed with the scopes in place. [Runtime icon](../../packages/UI/app/components/Icon/composables/useRuntimeIcon.ts#L42) · [Remount test](../../tests/native-e2e/native-consumer.spec.mjs#L220)

## Verification on the November 18 stack

- The app and native consumer passed typecheck and production builds. Vitest passed 462 tests in 69 files. The four ESLint rule tests passed.
- The clean native artifact compiled all 242 UI components. All 111 native browser tests passed across Chromium, Firefox, and WebKit. The app uses a client-only native root. The mixed Nuxt app covers server rendering and hydration.
- The native client bundle still contains framework `createVNode`. Its compiled UI components have no VDOM render imports. The final bundle excludes the interop plugin and the icon VDOM renderer. [Native bundle audit](native-vapor-audit.md)
- Across all three engines, 1,067 mixed browser cases passed, two failed, and two skipped. The skips cover a Chromium-only touch test. Firefox failed the ripple disposal assertion on both the full run and a focused repeat. WebKit passed that same assertion. [Ripple test](../../tests/e2e/vapor-ripple.spec.mjs#L67) · [Touch test](../../tests/e2e/picker-touch-focus.spec.mjs#L176)
- The mixed Chromium run passed 356 of 357 tests. The ScrollArea test observed the rail after its transition timer had already elapsed. Its two tests then passed five times each with one worker. Control the clock around the delayed mount to make the test deterministic. [ScrollArea test](../../tests/e2e/vapor-scroll-area.spec.mjs#L32)
- Repository lint reported 1,956 errors and 118 warnings before this review document. Of the errors, 1,887 came from `format/prettier`. The total includes documentation and source outside the migration.
- The local consumer scan covered 24,602 files across 37 projects. Two unclassified calls referred to a test's own `createComponent` helper. The scan found zero parse errors. Counts include templates and older applications with helper copies. [Consumer audit tool](../../tooling/migration/audit-consumers.mjs)
