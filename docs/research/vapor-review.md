# Vapor migration review — 2026-10-12

The source/API assessment, functional verification and GPT Luna screenshot
review are complete. The scope includes all
241 UI SFCs, shared UI/Utilities contracts and relevant component E2E states.
The family checkboxes are migration checkpoints; they do not certify execution
of every optional API or prop combination.

## Current upstream evidence

- [Vue 3.6 RC.1 Vapor guidance](https://github.com/vuejs/core/releases/tag/v3.6.0-rc.1): explicit native regions, declarative slot rendering, exposed DOM APIs, direct listeners when an ancestor stops delegated events, and cleanup-returning Vapor directives.
- [Current RC.11 changelog](https://github.com/vuejs/core/blob/v3.6.0-rc.11/CHANGELOG.md): the installed candidate matches the newest public prerelease checked on 2026-10-12. Compiler, hydration, slot and listener fixes require runtime regressions, not marker-based claims.
- [Vapor roadmap discussion](https://github.com/vuejs/core/issues/13687): maintainers explicitly confirm that instance enumeration and getCurrentInstance in Vapor are intentionally unavailable; the internal useInstanceOption API is not public.
- [Vue Router Vapor work](https://github.com/vuejs/router/pull/2509): still open at the audit date. Its discussion explains why registration of VDOM RouterLink/RouterView affects native bundles.
- [Nuxt Vapor support discussion](https://github.com/nuxt/nuxt/pull/35759#issuecomment-5309167632): merged compiler/interop support is separate from a wholly native Nuxt root. Native Suspense remains a stated limitation.
- [Vue watcher cleanup](https://vuejs.org/guide/essentials/watchers.html), [KeepAlive contracts](https://vuejs.org/guide/built-ins/keep-alive.html), and [SSR guidance](https://vuejs.org/guide/scaling-up/ssr.html) inform ownership, stale async work, cache disposal, deterministic initial state and request isolation.

## Confirmed repair

Tree's public node ID type permits numbers, but flattening, parent metadata,
search callbacks and drop-parent lookup used truthy guards. ID 0 was skipped.
The new browser regression first failed with no rendered nodes. Nullish checks
now preserve numeric zero while flattening still rejects absent/empty IDs.
The filtered view separately asserts its primary label and breadcrumb, so it
checks the intended flat-search UI rather than conflating their text.

All 57 Tree/TreeDms development cases pass in Chromium, Firefox and WebKit,
including the new zero-ID SSR/search/remount and parent-zero drag scenario.
The numeric query variants are in navigation and their localized links are
asserted. The subsequent native run passed all 36 cases, including numeric-zero
initialization and dragging a child into parent 0.

## Further verified findings

- ProgressBar's blend layers produced a low-contrast label. The text now sits
  above those layers with a dark foreground; the bar owns its stacking context.
  A browser check measures both default surfaces against the
  [W3C text-contrast threshold](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
  `label=false` also hides the label rather than printing a Boolean.
- Breadcrumbs now marks the actual last item when items come from its prop,
  and reserves separate space for its scroller and append/right content. Luna's
  suspected mobile overlap was rechecked and identified as horizontal clipping,
  not painted overlap; the focused test scrolls the current item into view.
- Tab's documented per-panel `keepAlive` now supports explicit opt-in and opt-out,
  with global filters/max still applying. Existing max/disposal tests caught a
  real regression when omitted Boolean props became false. An undefined default
  repairs that distinction; all 33 Tabs cases then passed in three browsers.
  The new variants have verified localized links and SSR coverage.
- ValueFormatter now handles empty formatted current/previous values, including
  null returned by a custom formatter. Zero and false remain visible values.
- Section now honors its public `titleElement` and is tested when its heading
  changes from the default to h2. Toggle tolerates an unset string model and
  exposes its checkbox state. Scroller arrows accept real keyboard activation
  without starting a pointer-hold loop; their labels are localized.
- Fixture corrections bound the standalone RadioButton, show Badge inline,
  size/state the custom Toggle bullet appropriately and bound the Tree example
  to its containing width. Tree search now reserves space for named actions.
  The dark sidebar uses existing theme variables for its active background.
  The unused CircleProgress animation ref/watch was removed; its SVG/CSS
  transition remains exercised.

Luna inspected the initial 96 images and the 288 dark/mobile variants, then the
72 presentation and 144 control/leaf images after repairs. Its subsequent
264-image Tabs/Tree review confirms the mobile actions are visible. Suspected
Chromium lifecycle clipping was reopened at original resolution: both paired
images contain the complete wrapped text, so that finding was withdrawn.
The Firefox full-component crop can scroll sticky Navigation over MainBar;
its paired viewport is intact. This capture behavior is recorded as such.

The 60-case visual matrix after the cache-default repair passes without skips or
retries. Its production navigation now awaits the actual Nuxt build-manifest
response before a full reload, preventing an aborted request observed in
WebKit. Renderer errors remain failures. The later boolean-query contrast/string-state checks passed all 24 focused
cases and the 12-case controls matrix; Luna inspected all 96 paired control PNGs.

## Coverage method and limits

The original setup kept screenshots only after failures. The visual runner now
captures both the visible viewport and complete component surface after asserted
states, with route, family, browser, theme and viewport metadata. It exercises
three browsers, desktop/mobile, and light/dark; no pixel baseline is automatically
accepted. Passing captures must be inspected by GPT Luna and findings reproduced
before any visual fix is considered verified.

The initial pilot covered presentation/control/leaf primitives, Tabs and Tree.
The later full suite, contract fixtures and open-surface matrix expand this to
input models/masks, dates, files, validation, dialogs, menus, tooltips, drawers,
query builders, Table/Pivot, virtual scrolling, dragging, errors and disposal.
Secondary browser contexts enforce the same renderer diagnostics as the page
fixture. Native routing/icons retain H05/I03; the limitations below stay explicit.

Static route/component reachability is only an aid to that audit. The initial
map reaches 231/241 SFCs and misses host/dynamic branches as well as actual
example gaps. It is not an execution count. Dedicated DateTimeFullInput, MiniCard/InputBlock, relative-time and standalone
month contracts now pass their focused browser/SSR checks. List/Selector numeric
zero and ColorPicker restrictions/keyboard controls were added to the same audit.
At that review checkpoint, Tabs' button/Enter checks and axe result did not
establish the [APG Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).
The subsequent API follow-up adds explicit tab roles and keyboard/focus coverage.
The native consumer verifies selected critical paths and its bundle; it is not
an individual browser mount of every eagerly imported SFC.


## Latest contract and lifecycle evidence

All 62 families' runtime extracts have been read, including all 241 SFCs. The
421 complete computed Class/Style bodies omitted from those extracts were then
read separately, together with 193 public type files' core signatures. Repeated
UI callback declarations and comments were collapsed in the signature view;
this is an API assessment, not execution of every prop combination.

The production sweep finished with 883 passes across 84 files, zero failures,
zero retries and two existing CDP-only touch-movement capability skips in
Firefox/WebKit. Chromium passed all 295 cases; the other engines passed 294
each. The earlier focused contract run passed all 96 cases.

After the fixture cleanup, all 153 affected cases in 13 files passed again in
three engines. This also verifies 44 strengthened class-token assertions:
`/is-open/` matched UnoCSS selector text even when the actual state class was
absent. The checks now require a complete class token. The public
DateTimeFullInput props are exported from the component type barrel, and
List/Selector nullish guards follow the project's `isNil` convention.

Both final typechecks and builds pass. The final unit run passes 317 tests in
54 files. Lint covers 217 changed/untracked source and test files with zero
errors and 16 remaining style warnings. Whitespace checks pass in all three
checkouts.

| Contract | Reproduced issue and repair | Evidence |
| --- | --- | --- |
| Relative time | Empty input produced `3undefined`; unit/exact preferences and clearing now persist | New browser replacement/clear/remount cases in all three engines |
| DatePicker | An early disabled-days return ignored allowed-days constraints | Calendar restrictions tested with both predicates and UTC/local display |
| Compact datetime | Cached time pane reset edits; cancelled touch pointerdown prevented WebKit opening | Cached activation resync, readonly icon guard, and matching DateInput's mousedown handling; touch/desktop/SSR cases pass |
| List / Selector | Scalar numeric zero lost initial focus or a multi-selection chip | Nullish guards; both chip layouts, keyboard selection, removal and remount pass |
| TreeDms | A late drop mutated retained data after unmount; public store lookup injected after setup | Captured setup store and scope guards; real browser drop, live rename and delayed rename/unmount pass |
| Input ownership | Clear/focus timers and delayed model commits survived owner disposal | Owned timers and guarded commit; disposal unit regression passes |
| Tree search rejection | A rejected custom promise retained the initial loader and could escape its owner | Public `error:search`, stored error and declarative `search-error` fallback; SSR pending markup, recovery and stale/unmounted rejection pass |
| ColorPicker | Disallowed theme/shade values were not filtered; palette swatches lacked keyboard activation | Case-normalized restrictions and named native buttons; keyboard selection and RGBA/Tailwind cases pass |
| Filter / focus timers | Table/Pivot debounce and deferred Form/Page/Selector work had no owner cleanup | Scope cleanup and owned VueUse timers; broader suite verifies supported interactions |
| Native i18n startup | Real i18n plugin was installed without loading messages, leaving translation keys | Public `loadLocaleMessages` before mounting, following [Nuxt i18n's public API](https://i18n.nuxtjs.org/docs/api/vue-i18n); native compact English 12-hour controls now pass |

The native consumer passes all 45 cases in all three engines, using
`createVaporApp` and real framework services. Its build eagerly imports all 241
SFCs and its bundle test rejects retained VDOM renderer/interop implementations.
That compilation/import count is not a count of 241 components individually
mounted in browser tests. Its rebuilt cleanup follow-up passes all 15 affected
cases, including the bundle, scalar-zero models, compact datetime and both
Selector overlays. Luna inspected all 60 initial native PNGs and all 864
completed visual-matrix PNGs. The native measurement fixture purposely
uses 90px visible columns with autofit disabled; oversized cell samples are
expected to clip until the separate Fit action runs.

CircleProgress's inline fixture slot shrank the SVG to about 49px while the
percentage stayed centered on the 80px container, overlapping its text. The
fixture now positions its slot beside the circle; browser geometry asserts an
80px SVG and separated labels. MainBar's fixture append has explicit spacing.
The demo drawers now stay within their own relative shells via supported UI
configuration, instead of covering playground navigation. All 36 fresh visual
cases pass across Chromium/Firefox/WebKit, desktop/mobile and light/dark.

The initial 144-case visual command had 138 passes and six mobile SSR navigation
locator failures. A 12-case no-JavaScript follow-up passes after including the
intentionally hidden navigation in the href check. Theme classes are applied
on client mount: hydrated pages assert the actual theme, while no-JavaScript
tests assert server content and localized links. The open-dialog/search/tooltip,
form-error/drawer/confirmation/options and nested Pivot matrix passes all 36
cases. Initial wrong-layout/locator and interrupted runs remain in the evidence;
they are not reported as successful commands.

Sticky Navigation can cover partially scrolled-away MainBar content in a full
component capture; the initial viewport shows both intact. The dark ProgressBar
white track is its configured blend-layer design; foreground contrast checks
pass. The deliberate measurement exception and narrow columns are diagnostic
states, not runtime failures. Byte-identical PNGs reuse an inspected image only
when SHA256 matches; changed images are actually opened by GPT Luna. The final
217 distinct cleanup images were all opened by GPT Luna. All three final
reports confirm the circle, append spacing and drawer boundary repairs, with
zero new actionable visual defects. Across the review, Luna inspected 4,390
recorded PNG paths. Every one of the 3,494 current passing-state PNGs has either
a direct inspection or an exact SHA256 match to one; the complete mapping is
in `final-image-coverage.json` beside the checkpoint.

## Boundaries still requiring separate work

- I03: unknown-at-build-time icons still need the user's accepted native strategy.
- H05: a wholly native Nuxt root and NuxtLink/to require the upstream routing work;
  compiler/interop support alone does not close this gate.
- B08: external consumers must be checked before deleting the legacy initRef path.

The three API findings from this checkpoint are addressed by the subsequent
Tabs/scroller/Tree follow-up:

- Tabs has named tablists, linked tab/tabpanel IDs, roving focus, disabled-tab
  skipping, wrapping arrows, Home/End, manual Enter/Space activation and optional
  automatic activation. Active declaration removal restores selection and focus.
  Custom navigation uses TabsNavigation; custom label controls bind its btnProps.
- VirtualScrollerVertical implements all five former stubs (`rerender`, `clear`,
  `triggerScrollEvent`, `renderOnlyVisible`, `updateRowHeight`). Browser tests
  inspect actual rows, valid events, synchronous height measurement before
  ResizeObserver, append, sticky clearing, empty data and disposal. Table's
  alternate-scroller autofit path is also covered.
- Tree's configuration and exposed scroller ref now use the main
  VirtualScroller contract. Tree owns flattened rows and canonical IDs, including
  numeric zero. Type regressions reject the old Vertical-only options.

The commands and final results are in [the API validation record](../testing.md#tabs-scroller-and-tree-api-follow-up--2026-10-12).

These findings distinguish a completed source/API assessment from complete
native migration or exhaustive runtime coverage. Validation and the post-repair
Luna reviews are finished. The remaining items above are separate migration/API
work; no unresolved reproduced regression remains in this review's tested scope.
