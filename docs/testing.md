# Testing and migration checks

Run commands from the application root. Install dependencies with `bun install`
and Playwright's pinned Chromium with `bunx --no-install playwright install chromium`
(on Linux CI, use `install --with-deps chromium`). No workspace tooling is required.

| Command                                               | Purpose                                                         |
| ----------------------------------------------------- | --------------------------------------------------------------- |
| `bun run test:e2e`                                    | Starts a Nuxt dev server, runs browser tests, stops it          |
| `bun run test:e2e:prod`                               | Builds Nuxt, starts production SSR, runs the same tests         |
| `E2E_BASE_URL=http://127.0.0.1:3011 bun run test:e2e` | Tests an already running server; caller owns its lifecycle      |
| `bun run test:e2e:report`                             | Opens the last HTML report                                      |
| `bun run test:tooling`                                | Tests the local ESLint rule, including generated import aliases |
| `bun run test:run`                                    | Runs existing Vitest tests once                                 |
| `bun run lint`                                        | Reports repository lint findings without changing files         |

Nuxt allows one dev process per checkout. If one is already running, pass its URL
using `E2E_BASE_URL` or stop it before using the managed dev command. Run managed
dev and production suites sequentially: they share generated Nuxt output.
The old `node scripts/test-vapor.mjs [URL]` command delegates to Playwright Test.

Playwright uses a managed Chromium, one worker, no retries, and retains traces,
screenshots and video on failure. Reports are ignored by Git. The initial suite
checks server HTML without JavaScript, hydration, model/slot/event updates,
VDOM Badge interop, unmount/remount, keyboard activation and axe WCAG A/AA checks
scoped to the probe. Browser errors and hydration warnings fail the suite.
Other existing app warnings (for example the missing `/zz` route) remain visible.
This does not certify the rest of UI, other browser engines or all accessibility.

For future component migrations, add the same behavior scenarios for VDOM→VDOM,
VDOM→Vapor, Vapor→VDOM and Vapor→Vapor. Add screenshot baselines for meaningful
layout behavior only, in a fixed browser/OS/font environment. Use fast-check for
state/model invariants and replay failures using its seed/path output.

## ESLint guardrail

`vapor/renderer-independent` is enabled for SFCs with a `vapor` attribute and
JS/TS helpers marked with a `@vapor-ready` comment. It flags instance access,
selected VDOM members, implicit emits in `useVModel`/`useVModels`, and `@vue:*`
element lifecycle hooks. It handles renamed imports and optional/computed
member access, but does not perform cross-file dataflow analysis or certify
third-party dependencies. Slot inspection and `unrefElement(componentRef)`
still require review. Existing unmarked VDOM code is not blocked.

A narrowly documented suppression exists in the runtime probe because it
intentionally detects the rendering mode. Do not use that exception in migrated
production helpers. Root ESLint also follows the imported code standards,
including the blank line before return statements. Existing repository lint
findings are not a reason to reformat unrelated files during migration.

Code standards: [skill](../.agents/skills/code-standards/SKILL.md).

## Vitest compatibility

The current app already uses Vitest 5. Nuxt Test Utils 4.2 probes the new
`vitest/runtime` export but also contains a fallback import of `vitest/environments`.
Vite attempts to resolve that removed export even when the fallback is unused.
The test-only alias in `vitest.config.ts` maps it to `vitest/runtime`, which exports
the required environment helpers. Recheck/remove this alias when upgrading Nuxt
Test Utils. This preserves the existing Vitest version; it is not a general claim
of complete compatibility with all Nuxt Test Utils APIs.

Vue 3.6.0-rc.7's Node/CJS entry does not export Vapor APIs. The config resolves
Vue, its renderers/reactivity and test-utils to their ESM builds and inlines
Vue consumers to preserve one runtime graph. It also sets NODE_ENV=test in
Vite's client environment: happy-dom uses that environment, and Nuxt's inherited
production define otherwise disables setup-ref unwrapping and VDOM stubbing
while the SFC compiler emits development templates. Node dependencies use the
same test mode. Keep the alias map as an object so Nuxt's own aliases survive
configuration merging. Recheck these preview workarounds when upgrading.

`tests/unit/vapor-runtime.spec.ts` mounts an actual compiled Vapor SFC via
`createVaporApp`, checks events/state/DOM cleanup, and verifies models and scoped
slots through a VDOM owner using test-utils and `vaporInteropPlugin`. Attach to
document for delegated events. Give the test-utils owner a native DOM root;
its root-node traversal does not support a raw Vapor component instance.
This does not replace browser layout or hydration tests.

The complete Vitest suite passes 138 tests across 28 files after F06. The input
fixtures now flush only their pending timers and assert the current 24-year
picker page. Pivot disposal uses a real effect scope; configuration tests check
configuration events separately from Tree's derived metadata updates.

## Selector migration

`/selector-vapor` exercises the migrated Selector with VDOM and Vapor parents.
Its Playwright scenarios cover controlled/local models, null/undefined,
public clear, search and keyboard focus, custom option keys and slots, remount,
and server HTML without JavaScript. The Vapor parent supplies a frozen initial
lookup to detect accidental mutation. See the [migration record](research/selector-vapor.md)
for the boundary between migrated code and remaining VDOM dependencies.

Development Vite logs can additionally report existing ResizeObserver loop
notifications when opening menus. These occurred in the original VDOM baseline
as well; production browser checks passed without those errors. A green suite
is not a promise of a warning-free development console.

## Input DOM contracts

`tests/e2e/input-prepend.spec.mjs` covers `stackLabel=false`: the empty label starts
after the prepend, floats to the field's left edge on focus or content, and returns
after clearing/blurring. It also changes prepend width, hides/restores it and reloads.
The stacked-label test alone does not cover these two distinct horizontal positions.

`tests/e2e/vapor-input-dom.spec.mjs` exercises `useInputUtils` with native Vapor
input/textarea elements: focus, select, blur, clear, model updates and SSR values.
It checks regular label alignment as prepend width changes or disappears and
after remount, native label focus, and drops into both real FileInput variants.
The file-input unit fixture exposes a nested DOM target deliberately, so falling
back to the component's automatic root would fail the drop test.

## Dialog anchors

`tests/e2e/vapor-dialog-anchor.spec.mjs` checks the layout helper under a native
Vapor owner: default parent, scoped target replacement, event changes, manual mode,
unmount and remount. A callback records writes even after owner disposal, so leaked
listeners cannot hide behind stopped watchers or suppressed component emits.
The page also opens/closes the actual VDOM Dialog through its declaration-site
trigger and verifies closed server output with JavaScript disabled. This does not
certify the full Dialog as native Vapor or test initially open SSR overlays.
A responsive scenario hydrates on mobile, selects options through Dialog/Menu,
and changes mobile → desktop → mobile. MenuProxy must start with the server's
Dialog branch on hydration; viewport-based switching starts after mount.

## Explicit helper events

`tests/e2e/vapor-events.spec.mjs` exercises the real scroll helper from a native
Vapor component and both List submit paths: keyboard events inside ListContent
and public `List.handleKey`. Ctrl/Meta+Enter must deliver one List event and one
injected form callback. Unit tests also cover filter update/removal without a
component instance and keyboard submission without a focused row.

## Table persistence

`tests/e2e/vapor-table-state.spec.mjs` uses the real Table store from native Vapor
owners. It checks reuse of an existing localStorage key, isolation of separate
keys, local state with omitted/null keys, remount, reload, and SSR without JavaScript.
This validates store identity/persistence, not the complete Table renderer.
Persistence diagnostics are rendered after mount because localStorage is client-only.

## Vapor registration lifecycle

`tests/e2e/vapor-scopes.spec.mjs` exercises two concurrent native Vapor owners
using `useArk`, `useZod` and `useFiles`. It covers unique registrations, shared
validation scope, file aggregation, visibility cleanup and removal/remount of
one owner without deleting the other owner's data. A separate no-JavaScript
case verifies SSR. Aggregate diagnostic counters are published after mount;
child setup registration is not used as parent hydration text.

## Form, nested ArkType/Zod paths and scope isolation

`/vapor-form` contains two independently submitted UI Forms with identical
`name`, `address.city` and `address.zip` paths. The default `base` scope uses
string `validation-path`; `billing` uses `{ scope, path }`. Each schema owner
and its nested address component run in Vapor; Form and TextInput currently
exercise VDOM interop. Both owners share the same validation store provider.

`/vapor-form-zod` repeats the same form scenario using `useZod` and a nested
`z.object` schema (`min(2)` for name/city, five-digit regex for ZIP). It shares
the nested address component and the same scope/path contract.

`tests/e2e/vapor-form.spec.mjs` runs the same three scenarios for both engines
(six tests total). It verifies initially hidden errors, visible inline
messages after invalid submit, live field correction, unchanged sibling errors,
scope isolation, successful submission with the actual nested payload, scoped
visibility reset without data loss, repeated unmount/remount without duplicate
registrations, and server-rendered fields without JavaScript. The parent keeps
billing values across unmount; resetting validation hides errors without
resetting those values. This fixture covers separate scopes, not multiple
independent schemas using the same paths within one scope.

Run against an existing dev server:
`E2E_BASE_URL=http://127.0.0.1:3000 bun run test:e2e tests/e2e/vapor-form.spec.mjs`.
For a managed production build (stop the dev server first):
`bun run test:e2e:prod tests/e2e/vapor-form.spec.mjs`.

## Menu and Tooltip anchors

`tests/e2e/vapor-overlay-anchors.spec.mjs` uses real VDOM Menu and Tooltip under a
native Vapor parent. It covers declaration-site parents, retargeting, trigger and
manual changes, Menu hide emission, Tooltip hover delays and cancellation,
unmount/remount, and closed server output without JavaScript. These are interop
checks; they do not certify native Vapor rendering of either overlay.

`tests/e2e/shared-tooltip.spec.mjs` additionally locks singleton ownership: the same
bubble DOM node survives handoff during hide delay with no new show delay. It checks
position/content changes, author slot injection and reactive updates, retargeting
an open tooltip without model reset, manual model arbitration and timer cleanup.
See [shared Tooltip](research/shared-tooltip.md) for root-host integration.

## Hiding overlays

`tests/e2e/vapor-hide.spec.mjs` invokes `$hide` from a native Vapor page with real
VDOM Dialog/Menu surfaces. It checks explicit DOM descendants, missing targets,
latest/all/type selection, ignore rules and ignoreUntilEl precedence, persistence,
force, repeated open/close and safe invocation during SSR. Controls dispatch their
command events directly because teleported surfaces may cover them; pointer hit
testing and focus behavior remain covered by Selector and overlay interaction tests.

## ScrollArea DOM ownership

`tests/e2e/vapor-scroll-area.spec.mjs` mounts the real ScrollArea under a native
Vapor parent and a DOM ancestor carrying transition styles. It covers delayed and
immediate initialization, content resize, adding/removing children, public scrolling,
disposal before initialization, remount and server content without JavaScript.
The ScrollArea itself still renders with VDOM; native dependency compatibility is
not established by this fixture.

## Floating targets

`tests/e2e/vapor-floating-target.spec.mjs` supplies a native Vapor component with an
explicit exposed `element` different from its root. Real Menu and Tooltip must use
that inner element, follow replacement within the same component, remove old
listeners, accept getters returning components or scoped selectors, and survive
unmount/remount and SSR. The retained VDOM `$el` fallback is compatibility only;
new Vapor components should expose the DOM element deliberately.

## Overflow registrations

`tests/e2e/vapor-overflow.spec.mjs` exercises the Utilities implementation through
Nuxt autoimport in a native Vapor owner. It checks equal initial results for independent registrations,
resize isolation, threshold and dimension differences, forced refresh, DOM removal
and restoration, queued refresh during owner disposal, and SSR without observers.
Schedule refresh after changing state; it resolves the current DOM target after
Vue's nextTick. Component refs must be converted to an explicit DOM getter.

## List DOM references

`tests/e2e/vapor-list-dom.spec.mjs` checks empty-state height and width reporting,
keyboard scrolling to an offscreen row in a virtualized List, and repeating that
navigation after removing and restoring the scroller. It also checks server HTML
without JavaScript. The owner is native Vapor; List and VirtualScroller still use
VDOM interop. `vapor-events.spec.mjs` covers the existing submit paths.

`tests/e2e/vapor-list-drag.spec.mjs` exercises pointer reordering in regular and
virtual scroller modes with a native Vapor owner and custom row exposing `element`.
Root and handle configurations are switched through an explicit List remount;
they are stable for each row lifetime. The tests cancel an active drag on owner
disposal and reorder again after remount. Permission is checked on each drag attempt,
including changes to reorderable without remounting the handle. A separate SSR case checks
server rendering without client drag effects. List and VirtualScroller remain VDOM.

The virtual List drag test also measures the drop indicator against the target row's
top and bottom boundaries before and after scrolling. This catches scroller padding
being counted twice (the original 8 px offset); targets stay outside auto-scroll zones.

The drag recycling scenarios scroll 6000 px during a live pointer drag, verify the
source row is absent from the scroller while the ghost remains, then either drop
it beyond the hundredth row or unmount the List. Both paths verify cleanup; the
cancelled path must not emit a move or change the order. The List store initializes the shared
drag manager with explicit refs and a move callback; rows access it through the store; recycled row registrations are disposed after the active drag ends.

## QueryBuilder DOM references

`tests/e2e/vapor-query-builder-dom.spec.mjs` exercises real pointer reordering,
cancelling a drag by unmounting its owner, remounting and reordering again, SSR
without JavaScript, inline first-condition editor opening, and synthetic touch
cancellation. It checks order preservation and removal of the body-level clone.
The owner is native Vapor; QueryBuilder and its editors still use VDOM interop.

### Tree drag targets

`tests/e2e/vapor-tree-drag.spec.mjs` checks the `/vapor-tree-drag` fixture with
1,000 nodes, a native Vapor owner and a custom Vapor node root exposing `element`.
Tree and VirtualScroller still use VDOM interop. Tests cover both `place` and
`parent` drops, Escape, unmount/remount during dragging, SSR without JavaScript,
completing a drop after virtualization removes its source node, and expanding
then collapsing a parent immediately after its first child is dropped into it.
A responsiveness regression test on the Czech route also requires the drop and
subsequent button interaction to finish within 1.5 seconds. It caught a 5.8-second
stall caused by publishing reactive metadata separately for every traversed node.
Use `?mode=parent` to try reparenting; the default mode reorders root nodes.

### Input menu anchors

`tests/e2e/vapor-input-anchors.spec.mjs` exercises `/vapor-input-anchors` with a
native Vapor owner and VDOM input components. It checks TextInput guidance and
IconInput, ColorInput and YearMonthSelector picker placement, including remount
with an open picker, and server output without JavaScript. The existing
`vapor-input-dom.spec.mjs` covers input APIs, label layout and file drops.

### Table/Pivot DOM targets

`tests/e2e/vapor-table-pivot-dom.spec.mjs` exercises `/vapor-table-pivot-dom`:
scroll synchronization, column resize and justify after hydration and remount,
SSR without JavaScript, a single hydrated Pivot content subtree, pointercancel
and direct component unmount during resize. `?warning=true` lowers the transform
warning threshold and checks that Run anyway can resume initial rendering.

The `?wrapper=true` regression is an expected failure tracking interop issue I01
in `docs/vapor-migration.md`. In Vue 3.6.0-rc.7, removing a native Vapor parent
div does not dispose its nested VDOM Table, leaving document resize state active.
The local runtime patch has been removed. This mixed-renderer limitation does not
block migration to native Vapor; recheck the test after upgrading Vue or converting
the descendants, then remove the expected-failure marker once cleanup works.

The navigation example `?loading=true` delays the initial Pivot fetch to show its
full-area XL loader. Tests cover deferred fetching and client remount with
`?loading=immediate`, keeping the loader until transformation finishes and hiding
the empty state in the meantime. SSR/hydration still await immediate initialization.

The SSR assertion also requires the initial Pivot overlay to remain visible in
server HTML. Hydration removes it only after mount and a DOM update; the hydrated
content test verifies that the overlay disappears and virtual rows are visible.

### Native ElementMovement

`tests/e2e/vapor-element-movement.spec.mjs` exercises native Vapor ElementMove
and ElementResize under a native conditional parent. It verifies model updates,
cleanup during active move and resize, no further updates after removal, remount,
and server-rendered handles without JavaScript. The navigation example is
`/vapor-element-movement`. CornerResize has separate coverage in `vapor-corner-resize.spec.mjs`.

### Gesture frame scheduling

`useRafTask.spec.ts` checks burst coalescing, final-value flush and cancellation
on scope disposal. Movement and QueryBuilder E2E tests include pointer move and
release in the same JavaScript task, before RAF can execute. Movement additionally
checks a virtual Menu header mounted after opening and Escape cancellation.
List/Tree retain Dragdoll's built-in RAF sampling and have release-position handling;
their drag, virtualization and cancellation suites remain the regression coverage.
Table/Pivot resize uses the same flush/cancel contract. The known I01 wrapper test
remains an expected failure; it is not evidence of working interop cleanup.

QueryBuilder's “Toggle scroll viewport” control constrains the example in both
axes. Its autoscroll regression holds the pointer near the viewport corner,
asserts both scroll offsets advance, and verifies Escape stops scrolling without
reordering. Autoscroll is owned by Dragdoll's plugin; no independent interval or
continuous RAF loop remains in QueryBuilderRow.

The QueryBuilder drag regression asserts that the drop indicator is visible and
aligned with the target row before release. Dragdoll mutates a reused move event;
QueryBuilder must snapshot its coordinates to notify the reactive target watcher.

The root-target regression checks the arrow's visible width against overflow
ancestors. QueryBuilder renders its fixed drop marker through Teleport to body;
viewport coordinates update on captured scroll and resize events, and the marker
stays within the visible scroller area even for an oversized root group.

### QueryBuilder hierarchy and drag performance

The default `/vapor-query-builder-dom` example contains 24 conditions in four
nested groups (28 nodes including the root). `?small=true` retains the three-row
baseline; both variants are in localized navigation. The collapsible data preview
shows IDs and paths after moves.

`tests/e2e/vapor-query-builder-hierarchy.spec.mjs` covers repeated drag movement,
inter-group moves from a two-digit sibling index, stable DOM on sibling reorder,
and moving an entire nested subtree. It attaches frame timing JSON and applies a
100 ms p95 interaction budget to catch repeated stalls rather than startup noise.
This is a development Chromium regression budget, not a production FPS guarantee.

On this machine, the same 24-condition drag test measured p95 **150.5 ms** before
the fix and **8.9 ms** after (143 frames, max 17.4 ms, no frames over 100 ms).
A CPU profile pointed to repeated component/prop processing rather than layout.
Per-row computed hover/drag booleans prevent unchanged rows from re-rendering.
Stable ID keys and moving the existing item object preserve sibling component
identity. The larger data set also caught incorrect last-character index parsing
and treating sibling path `...1` as an ancestor of `...10`; both are corrected.

### CornerResize

`/vapor-corner-resize` demonstrates native Vapor corner-value adjustment with
step 5, per-corner limits and inversion. Its E2E tests check the resulting model,
release before RAF, configured handles only, cleanup during a gesture, remount,
SSR and the localized navigation link. Dragdoll owns pointer sampling and disposal.

### TreeDms external drop

`/vapor-tree-dms-drop` is linked in navigation. Its E2E tests exercise native
TreeDmsDropZone beneath the existing TreeDms/Tree interop, preserving the target
folder on immediate release and after remount. Synthetic DataTransfer files use
an isolated FileSystemEntry adapter because Chromium does not attach OS entries
to synthetic transfers. The SSR test checks folder content and the localized link;
it does not certify hydration warning-free virtual scroller layout (min-height
36px vs 0px was observed and remains tracked in the migration checklist).

### MenuConfirmation focus

`/vapor-menu-confirmation` demonstrates native Vapor MenuConfirmation with its
existing MenuProxy and native Btn dependencies. Tests cover desktop and mobile layouts,
autofocus, Enter confirmation, the second confirmation stage, hide/reset, remount,
explicit focus methods for both a button and link, SSR and localized navigation.
Btn's native marker provides `element` and `focus()` without depending on `$el`;
legacy `getElement()` behavior remains unchanged.


### TanStack VirtualScroller: rows and columns

VirtualScroller is the shared native Vapor implementation for rows and optional
columns, retaining vertical defaults. Set `scrollerConfig: { virtualizeColumns: true }`
in Table to enable both axes. The separate Grid wrapper and registration have
been removed; column props now belong to IVirtualScrollerProps. Direct consumers
set `virtualizeColumns` on VirtualScroller itself. Existing scroll/measure/clear APIs
are implemented alongside scrollToColumn and scrollToCell.

TanStack owns measurements, offsets and ranges. Its
[initialRect](https://tanstack.com/virtual/latest/docs/api/virtualizer#initialrect)
provides SSR geometry: initialRowsRenderCount selects exactly that many initial
rows (small nonvirtual lists still render all rows), and an estimated 1280px width
bounds the initial columns. Browser dimensions replace those estimates on mount.
The SSR tests disable JavaScript; hydration tests capture errors and warnings.
Vapor function refs are measured after DOM insertion, avoiding zero-height
measurements and resulting scroll compensation. A static display:contents root
keeps hydration style checks inside the native block while forwarding attributes
and the public element ref to the actual viewport.

`/vapor-table-fetch-more` exercises the real Table loading pipeline with a delayed
in-memory loadData callback: pages 25/25/25/8, cursor/skip values, fetch veto,
concurrent scroll events, scroll position after append, cell growth/shrink,
recycling all 83 rows, end-of-data, search replacement and reload. The short=true
variant loads three rows per request and must fill the viewport without input.
Data or viewport changes must check whether more rows fit even when scrollTop
and the content's stretched DOM height remain unchanged.

The fullscreen=true variant enables column virtualization with 80 columns, initially fetching 20 of
1,000 rows. It must fill a tall screen, retain Y during horizontal scrolling,
fetch another page when the screen grows, then reach all 1,000 rows in exactly
50 serial requests and stop. It verifies unique row IDs and a bounded rendered
row count. This is an integration test, not a backend or frame-time benchmark.

`/vapor-virtual-grid` exercises a static 1,000 × 80 table, variable column widths,
a direct jump to row 500 / column 60, header/body alignment, column resize,
both-axis end/origin navigation, remount and bounded SSR output. Synchronizing
Table's horizontal position writes scrollLeft directly so VueUse's cached Y
cannot undo a simultaneous vertical movement. Card layout receives all fields.

`/vapor-virtual-scroller` checks compatibility methods, dynamic row growth/shrink,
recycling, separate instances, append/empty/remount, small-list behavior and SSR.
The existing List and Tree suites cover dragging and cleanup with the new engine.
Sticky VirtualScrollerVertical in Pivot retains its existing implementation.
Known I01 wrapper-disposal and HY01 Tree-initialization diagnostics remain separate.

Validation (2026-09-06): the eight affected Playwright suites completed with
32 functional passes and the two tracked expected failures (I01 and HY01).
Targeted ESLint and git diff whitespace checks passed. The existing Nuxt dev
server was used because Nuxt locks a project against a second dev server.

### Async Markdown row heights

`/vapor-virtual-markdown` contains 200 notes with different paragraph counts,
lists, quotes, code blocks and tables. Each mounted row requests a deterministic
fixture endpoint, which delays the response and parses Markdown with `comark`.
`@comark/vue` renders the parsed document inside a VDOM Suspense boundary under
the native Vapor scroller. Completed documents are cached in the page's rows;
unmounted pending requests are aborted. SSR renders six useful previews; full
bodies intentionally arrive after client mount. `?slow=true` triples the delay.

The Nuxt Comark module's compiler transform is incompatible with the current
Vapor compiler, so this example imports the Vue renderer directly without the
global Vite transform. See [Comark's renderer guide](https://comark.dev/rendering/vue).

`vapor-virtual-markdown.spec.mjs` gates real requests to compare placeholder and
rendered heights, then checks wrapping on width change, collapse/expand, distant
scrolling, cache reuse, bounded DOM and adjacent row geometry. A separate no-JS
case checks SSR previews and both localized navigation links.

### Markdown inside Table cells

`/vapor-table-markdown` passes the `description` column slot's actual `value`
to `ComarkTableCell`, which uses `@comark/vue` Markdown inside Suspense. The other
two columns use the standard cell renderer. All 200 rows are local: no request,
timer or artificial delay. Comark parsing runs immediately, including during SSR.
Controls grow/shrink descriptions and jump through the virtualized dataset.

`vapor-table-markdown.spec.mjs` verifies formatted paragraphs, lists, quotes and
code, updated cell values, row measurement after growth/shrink, adjacent row
alignment, recycling, SSR formatting without JavaScript and localized navigation.


### Table and Pivot focus contracts

`/vapor-table-focus` is a native Vapor owner with real Table/Pivot menus and
both default TextInput and custom native Vapor cell editors. The custom editor
exposes focus/select explicitly and has no `.control` selector. TableRow uses
component refs; DynamicInput forwards select to preserve text selection.
Filter menus register targets by filter ID and focus added items after DOM updates.
Table keyboard handling uses the event target inside its own table instead of
shared active-element state.

`vapor-table-focus.spec.mjs` checks repeated editor mount/selection/Escape,
reopening a single filter, adding and typing into the second condition in both
real menus, SSR without client editor effects and the localized navigation link.
This completes E03's lifecycle work; it does not mark Table or Pivot's entire
component family as migrated.


### File preview dialog

`/vapor-file-preview` uses native Vapor FilePreview2 inside a native Vapor owner.
The image dialog is declared in its template, while Dialog remains VDOM.
The fixture switches an SSR image to local image/video/document FileModels;
the video payload tests source/lifetime handling, not codec playback.

`vapor-file-preview.spec.mjs` checks repeated opening/Escape, replacing an open
image, unmounting an open dialog, blob URL revocation, media branches, the remove
emit, hydration errors and SSR navigation without JavaScript. The page-size plugin → UI store → useViewport startup warning discovered here
is fixed and covered by the separate viewport suite (F08). The current staged
FilePreview2 has removed the previously verified blob URL lifecycle handling;
the revocation assertion currently fails. This concurrent change was preserved
while fixing viewport initialization; the failing assertion has not been weakened.


### Viewport initialization

`/vapor-viewport` displays UI store dimensions in a native Vapor component.
`useViewport` runs in the store created by the page-size Nuxt plugin; browser
measurement waits for `onNuxtReady` and does not require a component lifecycle.
The cookie diagnostic stays pending until mount because page-size updates those
cookies before hydration. The actual width/height diagnostic renders during SSR
and hydration, so the test can detect a premature state change.

`vapor-viewport.spec.mjs` checks client hints over cookies, cookies over device
fallback, raw SSR output before client measurement, post-hydration dimensions,
resize cookie updates, reload and localized navigation. It rejects startup
lifecycle warnings and hydration mismatches. width/height intentionally remain
initial layout dimensions after resize; use a live measurement API for resize.


### Input mask lifecycle

`/vapor-input-mask` binds the shared useInputMask adapter directly to a native
Vapor input. The adapter uses IMask with an explicit element ref and scope cleanup;
vue-imask's VDOM lifecycle hooks are no longer involved. It keeps a headless mask
for SSR and for writes while no DOM element is present.

`vapor-input-mask.spec.mjs` checks typing and cursor position, radix updates,
null/zero writes, ref and owner remounts, SSR and localized navigation. A direct
callback counter detects events from detached elements even after component
emits/watchers stop. It also exercises real VDOM NumberInput, CurrencyInput and
DateInput models. The input DOM suite covers native textarea and label regressions.

`useInputMask.spec.ts` and `useInputMask.ssr.spec.ts` cover pre-mount writes,
formatting, incomplete patterns, callback ordering, shared mask isolation and
scope disposal. The broader useInputUtils.spec.ts now loads and passes with the
ESM runtime and client-environment corrections described under Vitest compatibility
(F06).


### Programmatic dialogs

`useDialog()` now returns `dialogs` alongside `createDialog`. Render
`<DialogHost :dialogs>` under the same owner/provider; there is no global host
or detached render tree. The host inherits normal context. `createDialog` accepts
the existing props and `children` option (VDOM render functions, also components),
and returns a `close()` handle that checks `beforeHideFnc`. The host default slot
receives `dialog` and Dialog's scoped props such as `hide` and can render native
Vapor content declaratively. An explicit `elRef` supplies the dialog target;
it no longer identifies a DOM container to overwrite. Server calls do not create
entries; use client interactions to open dialogs. Scope disposal drops all entries.

No application/layer callers remained before this migration. External consumers
must add the explicit host when adopting the changed composable. DialogHost and
Dialog remain VDOM boundaries; legacy render functions are confined to content.

`/vapor-programmatic-dialog` uses a native Vapor owner and both declarative and
legacy functional content. Its three Playwright tests verify reactive provider
context, default and named slot close functions, independent concurrent entries,
close guards, onHide counts, Escape, owner disposal/remount, closed SSR output
and localized navigation. The existing dialog-anchor suite also passes.


### Tabs: vnořené deklarace a cache

`/cs-CZ/vapor-tabs?mode=basic` používá `<Tabs><Tab name="tab1">Content</Tab></Tabs>`
bez `items` i bez v-model. Druhý panel obsahuje další Tabs s vlastním providerem.
`/cs-CZ/vapor-tabs` a varianty `mode=plain` / `mode=filtered` ověřují deklarace
z v-for, přidání/odebrání, pořadí a popisky, vlastní navigation slot a fallback,
reaktivní inject, lazy obsah a native KeepAlive. Registr sdílí LRU limit napříč
panely; filtry dál pracují s názvy `Tab_<name>`.

`tests/e2e/vapor-tabs.spec.mjs` kontroluje DOM, zachování/reset stavu, lifecycle
hooky, vyřazení z cache, unmount, SSR bez JavaScriptu a lokalizované odkazy.


### DynamicInput: podmíněné sloty a dynamický vstup

`/cs-CZ/vapor-dynamic-input` a `tests/e2e/vapor-dynamic-input.spec.mjs`
ověřují nepřítomné/podmíněné prepend/append sloty, scoped clear/focus, změnu
string → number, model, veřejné focus/select, remount a SSR atributů bez
hydration mismatch. `vapor-table-focus.spec.mjs` kontroluje editory Table/Pivot.
D05a nepřevádí samotné TextInput/NumberInput ani všechny wrappery z D05.
