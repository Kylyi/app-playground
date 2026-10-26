# Native Vapor consumer and cleanup audit

The 2026-10-25 verification round uses Nuxt 4.6.1 and matched Vue
3.6.0-rc.11. The standalone consumer is in `tooling/native-consumer`.
It includes UI `2.3` through `47fbf0c5` and Utilities through `88ea6b3`,
with the existing local Vapor migration preserved.
The [sync verification](vapor-sync-2.3-2026-10-25.json) records the integration;
the fresh [mount-fix verification](vapor-mount-verification.json) records the latest
111-case native rerun and final bundle audit.

## What the consumer proves

The client boots with `createVaporApp`, real Pinia, Nuxt router/i18n/device
services and the UI plugins. It installs no `vaporInteropPlugin`. Mount runs
outside `app.runWithContext`, so component injection resolves through the local
owner. The normal Nuxt creation/mount hooks still run. UnoCSS is imported
explicitly because this entry replaces Nuxt's generated plugin entry.

An eager import keeps all 242 UI SFCs in the build graph; all 242 compile as
Vapor. This inventory is a build check, not a claim that every optional branch
has been exercised.

The final native browser run passes 111/111 cases in Chromium, Firefox and WebKit,
with no skips, retries or expected failures. The readable audit build contains
443 final JavaScript files (442 compiler chunks and one worker) and
7,280,762 bytes of JavaScript. It intentionally imports every UI SFC; these
unminified bytes are an audit metric, not a performance comparison.
The portable [bundle report](vapor-native-bundle.json) preserves its component,
chunk and retained-symbol inventory.

The audit runs in Nuxt's `nitro:build:public-assets` hook, after copying the
final files and before the server indexes their lengths and hashes. This covers
late code injection and the worker that the old compilation-only byte count
omitted. The served report is verified byte-for-byte against its file. Rewriting
it after the server build is deliberately avoided: that produced a truncated
HTTP response during this audit and was repaired before the green 96-case run.

The browser suite covers synchronous and asynchronous Tree initialization,
stale search results, drag/drop and owner removal; Tabs cache; confirmation
keyboard focus; scroller APIs; movement; Table measurement providers and
temporary-content cleanup; Table/Pivot scroll synchronization and remount;
cell editor commit/cancel; Selector slots/models; QueryBuilder dynamic editors;
native UI links and runtime icons (including failed/stale requests);
native programmatic Dialog injection, updates and disposal; registered/imported/
resolver component descriptors, custom List rows and validation-queue cleanup;
Collapse resizing/caps; the 2,000-record Pivot worker remount; and global UI
listener disposal. Hover scrolling covers reduced motion, fractional WebKit
offsets, live target replacement and owner disposal; overflow callbacks resize
their actual observed target. Column option controls have localized names and
report keyboard-open state. Browser exceptions, console errors and hydration/Suspense
diagnostics fail these tests.

```sh
bun run test:e2e:native
bun run typecheck:native
```

This command builds the consumer, runs its production server on port 3022,
tests Chromium/Firefox/WebKit, and stops the server. To inspect it manually:

```sh
bun run build:native
PORT=3022 HOST=127.0.0.1 node tooling/native-consumer/.output/server/index.mjs
```

The standalone root is CSR. The main playground separately tests real Nuxt SSR,
JavaScript-disabled HTML and production hydration in all three engines.

The latest synchronization adds a three-engine native external Tree drop
regression. The new callback reports viewport coordinates and leaves source
nodes in place. Existing drag cancellation, owner cleanup, runtime-icon
retention and native measurement cases remain green. The upstream container
label feature uses declarative native slots on both button roots; its
`createReusableTemplate` implementation is not reintroduced.

The 2026-10-22 parent comparison added thirty runtime-icon owner remounts in
every engine, with GC DOM/listener counters in Chromium. It uncovered reactive
async-data keys and cached icon handlers retaining removed native-parent UI.
The icon helper now owns the data effects and temporary teardown scope, while
cached handlers capture request values rather than component setup context.
Both performance matrices passed their retention gates after that repair;
that checkpoint's full native suite and 48 affected production cases were green.
See the
[performance diagnosis](vapor-performance.md) and
[parent-comparison verification ledger](vapor-performance-verification.json).

## Bundle gate H05 remains open

Every build emits `.output/public/_nuxt/native-bundle.json` inside the consumer.
The report records final emitted files, retained implementation symbols, framework modules,
compiled UI components and icon renderer dependencies. The readable bundle excludes `baseCreateRenderer`, `ensureRenderer`,
`vaporInteropImpl` and `vaporInteropPlugin`. It still contains `createVNode`
and related helpers. Nuxt framework services and NuxtLink retain VDOM render
functions; shared Vue runtime-core code alone is not proof that a renderer is
present.

The old empty Chip probe is removed. `?family=links` now proves real anchors,
labels, live targets, named navigation, keyboard and Back without interop.
Chip, MiniCard, FilePreview2, TableRow and SelectorInner use native UILink;
Btn shares the same public Vue Router useLink contract. Whole-row links use an
accessible overlay beside cell links/actions, avoiding invalid nested anchors
and preserving their independent navigation. Boolean/empty downloads retain
the source filename. External route objects resolve a real href and use
document navigation. Keyboard focus paints a whole-row outline above the
cells without changing their pointer layering; active-link text meets 4.5:1
contrast in the tested light/dark themes.

`?family=icons` proves HTTP-supplied names, aliases, custom SVGs, monochrome and
multicolor rendering, request sharing, cached remount, stale-result protection,
provider failure and app disposal. Nuxt Icon remains the server data provider;
its VDOM rendering components and `@iconify/vue` are absent from this consumer's
client graph. The 242 compiled UI entries contain no VDOM render imports.
I03 is closed for the UI's icon-name/class contract.

The filesystem now contains 63 families, including the new Link family.
The application still boots through Nuxt's VDOM root and pages/layouts.
The user deferred that work. Framework helpers in the consumer graph still
prevent calling the entire bundle VDOM-free; H05 and consumer rollout in B08
remain open. The [final contract/consumer audit](vapor-final-contract-audit.md)
records the completed review and the compatibility paths still in use.

## Workaround and lifecycle decisions

| Item | Decision and evidence |
| --- | --- |
| Tree asynchronous built-in flatten/search | Removed. Synchronous data is available before rendering; custom promises keep a deterministic pending first pass and discard stale/unmounted results. No async setup or Suspense requirement. |
| Pivot conditional top-level await | Removed. Small transforms commit before rendering; workers and performance confirmation remain asynchronous. Immediate SSR fetches serialize source records through Nuxt state for matching hydration. |
| Pivot payload initializer | Removed. Nuxt retained its setup closure, keeping removed stores and DOM alive. Undefined seeds need no initializer, and each unmounted Pivot clears its own payload key. Thirty remount cycles now show stable DOM/listener counts; the performance report retains the before/after evidence. |
| DialogHost VDOM render wrapper | Removed. Declarative dynamic components preserve native owner injection and the hide callback. Optional VDOM children remain supported by mixed consumers. |
| VirtualScroller temporary `div.contents` | Already removed on RC.11; the final SSR/layout/remount regressions retain that removal. |
| UI NuxtLink children | Removed. Native UILink/public useLink own anchors, activity and navigation; optional Boolean prefetch defaults preserve absence. Button click callbacks run before navigation so preventDefault works. |
| Icon class-only runtime gap | Removed. Native spans use serialized Nuxt data and CSS masks/backgrounds. Static SVGs keep content hashes; unused generated SVGs are pruned after client/SSR collection, and the unneeded client icon dataset is disabled. |
| Runtime icon data ownership | Reactive-key disposal reads are collected in a temporary cleanup scope; cached handlers capture plain request state and the fetch function. This prevents dead native-parent owners being retained while preserving SSR, shared/cached requests, aliases, colors and cancellation. Thirty-cycle retention and three-engine production regressions pass. |
| Resize delivery | Table width/breakpoint and relative-width updates run in owned frames. Scroller child measurement also runs in a frame because edge controls can resize ancestors. Closed menus no longer observe anchors during Dialog entry; open-menu repositioning uses its scope-owned frame task. Reproduced WebKit Dialog/card-remount/Markdown/row-save loops are fixed without filtering diagnostics. |
| UI store document listeners | Scope-owned VueUse listeners replace unremoved manual listeners. Disposal is checked after stopping Pinia/the app scope. |
| Pointer re-entry state | Normalize the root HTML `mouseenter` event. Firefox viewport changes can return from outside with no `relatedTarget`, leaving VueUse's page-leave flag true and blocking genuine input clicks. The responsive Selector regression covers the return to mobile. |
| Deleted UI preferences | Restore defaults synchronously when Cookie Store reports a deleted cookie as `null`; field/Table consumers retain usable preferences. The browser regression clears the actual cookie and opens an editor. |
| Menu layout callbacks and bounce listener | Pending frame work and animation listeners are owned and cancelled; detached floating elements are not measured. The redundant position throttle is removed: its trailing timer could schedule a new frame after scope disposal. |
| ResizeObserver frame delivery | Required. Content-size events can resize an ancestor menu; delivering inside the observer loop reproduced a WebKit exception. Scope-owned frame delivery removes that loop without filtering errors. TanStack's frame-based row measurement remains. |
| Gesture selection styles | ElementMovement, CornerAdjustment, Table and Pivot use the browser-supported property, including WebKit's prefix. Safari ignored the old Table/Pivot `style.userSelect` assignment and still allowed selection. Release, cancel and owner removal restore the prior value and priority. |
| Field opening-click ownership | Retain the original pointer-down through the click's shared ancestor. Firefox can resize the focused control before pointer-up; the opening gesture must not close the newly opened mobile Selector. Later wrapper clicks still toggle normally. |
| InputWrapper prepend measurement/readiness | Retained. It compensates actual changing prepend width and prevents an initial layout transition; root CSS variables are restored. It is layout behavior, not a renderer adapter. |
| Tooltip content target | Retained. The explicit `display: contents` element is the DOM target for shared native Teleport content. |
| Vue ESM aliases/inlined test dependencies | Required on RC.11. Removing them creates separate runtime graphs or selects a Node entry without Vapor. No dependency source patches are retained. |
| Development dependency optimization | Pre-bundle the 42 imports observed in Nuxt's late-discovery messages and Vite metadata, including Comark, autoimported Utilities dependencies and development tools. Successive dependency-discovery batches invalidated the client graph with `504 Outdated Optimize Dep`. Keep the explicit inventory until cold initial scanning includes those paths automatically. |
| Legacy initRef and public `$el` compatibility | Retained for supported consumers. No migrated production caller needs the legacy instance API, but the completed external audit finds 115 calls across seven projects. Removal requires their rollout in B08. |
| Breakpoint and reduced-motion queries | Setup-owned queries replace computed/module-owned listener creation. MenuProxy's three-per-Table-remount leak is repaired; active hover-text owners share one disposable reduced-motion scope. |
| List asynchronous work and validation queue | Initial built-in List rows render synchronously on the server. Custom promises, focus frames and validation callbacks belong to their owner and cannot commit after disposal. |
| Collapse and drawer frames | Empty height-adjustment code is implemented; resize observation and delayed opening cancel on removal. Drawer release flushes the final width, while disposal cancels it and detaches document listeners. |
| Generated icon writes | Real concurrent builds exposed a malformed manifest. A bounded file lock serializes manifest updates; atomic rename publishes complete SVG/JSON assets. No icon rendering option or dependency source patch is introduced. |

Type cleanup uses `ComponentExposed` for generic/native component APIs and
explicit transport/ref types. It does not disable production type checking.
The consumer includes layer production source; layer `*.spec.ts` harnesses are
excluded from that application project and run in the root Vitest suite. Existing
unrelated repository lint findings remain outside this round; affected source
lint is checked separately.
