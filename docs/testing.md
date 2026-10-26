# Testing and migration checks

## Row tuning and corrected controls — 2026-10-25

The [latest ledger](research/vapor-mount-verification.json) binds this round's
source snapshot, scope and results. [Raw corrected evidence](research/vapor-performance-tuning.json)
includes all timing samples, paired intervals, profiles, row counts and rejected
experiments. The Nuxt app root remains deferred.

| Check | Result |
| --- | --- |
| Production E2E, 31 files / three engines | 481 passed; 2 existing CDP skips; final complete rerun, no retries or flaky cases |
| Complete native suite | 111/111, no skips or retries |
| Unit / benchmark tooling | 344/344, 61 files; 8/8 Node checks |
| App, native and corrected benchmark types | Zero diagnostics |
| Affected lint / three checkout whitespace checks | 25 files clean; all pass |
| Corrected benchmark | 1,280 samples in paired trials, 120 SSR/hydration, 60 DOM parity and 12 directive interaction checks |
| Cleanup and separate diagnosis | 30 GC remount cycles per family/variant, 16 scroll runs, 240 CPU profiles and 12 traces |
| Report HTML | Three engines / four widths; zero Axe violations; keyboard, offline, no-JS and print checks pass |
| Native bundle | 242 native SFCs, zero UI VDOM imports or icon renderer modules; 443 JS files, 7,280,762 unminified bytes |

New cases cover Tree source edits published through the model after built-in
and custom searches, remounts, Pivot ordinary/standalone cell formatting and
labels, zero/missing values, row/cell keyboard events, changed orientation,
and Table provided-empty/conditional slots in regular and card views. Both new
localized query links are followed with JavaScript disabled. Tests wait for
hydrated readiness before interaction and separately inspect server HTML.

The broad run had one Chromium drag setup timeout caused by a recycled virtual
row. After restoring the viewport in test setup, the complete 33-case Tree
file passed in three engines and the failing case passed five Chromium repeats.
The final source then passed the complete 31-file rerun. The original broad
480-pass/2-skip/1-failure report and artifacts remain recorded.

Broader cases retain workers, filtering, resizing, scrolling, editing, drag,
links, runtime icons and cleanup coverage. Corrected VDOM controls use the
proper directive lifecycles; their typechecks and real interactions pass.
Earlier viewport initialization, slot forwarding and known-leaf icon fixes
remain in place. [Performance assessment](research/vapor-performance.md).

## 2.3 synchronization — 2026-10-25

UI `2.3` through `47fbf0c5` (26 incoming commits) and Utilities through
`88ea6b3` (8 incoming commits) are merged into their `2.3-vapor` branches.
Existing local migration changes and every original untracked layer file are
preserved. Local merge commits are UI `f8240fbf` and Utilities `99364d9`;
integration fixes remain alongside the existing uncommitted migration work.
The [verification record](research/vapor-sync-2.3-2026-10-25.json) preserves the
source hash, browser scope, capability skips and native bundle checksum.

| Check | Result |
| --- | --- |
| Standalone native, Chromium/Firefox/WebKit | 102/102 passed; no skips or retries |
| Affected production, 16 files and three engines | 280 passed; 2 existing Chromium-CDP-only capability skips; no failures, retries or flaky cases |
| Unit suite | 344/344 in 61 files |
| Application and native typechecks | Both pass with zero diagnostics |
| Affected lint | 81 files; zero errors, seven existing brace-style warnings |
| Application/UI/Utilities whitespace checks | All pass |
| Fresh native bundle | 242 native UI SFCs, zero UI VDOM render imports or icon renderer modules; 443 JS files including the worker, 7,273,127 unminified bytes |

The production run includes no-JavaScript SSR and hydrated interaction checks.
New regressions exercise container-based labels on native button/anchor roots
and custom slots, segmented ButtonGroup selection/disabled/keyboard behavior,
external Tree move/return/drop/Escape/owner cancellation, and a new Table query
superseding a held page while rejecting its late result. The three new variants
are in localized navigation and their links are verified in the browser.
The native suite separately proves external Tree drops without interop.

The sync retains native declarative slots instead of importing the upstream
button's VDOM reusable-template helper. It combines Tree reporting with existing
owned cancellation, uses the public native scroller element for empty-table
autofit, removes a duplicate Menu header binding, and preserves runtime legacy
icon names alongside custom Uno variants. Numeric-string sorting retains the
synchronous Vapor API and removes ambiguous repetition from the upstream regex.
Binary toggles use switch semantics; tri-state/mixed models retain checkbox
semantics and existing focus behavior. The updated Pivot unit expectation
reflects the intentional removal of a duplicate grand total without column fields.

Nuxt stays on 4.6.1 / Vue 3.6.0-rc.11. Axios is 1.20.0 in both layers and the
existing root installation. The Nuxt app root remains deferred. Performance
and visual checkpoint counts below describe their recorded source snapshots;
this synchronization does not relabel them as fresh measurements. Final logs,
reports and recovery snapshots remain in `.cache/sync-2.3-2026-10-25`.
Temporary Git stashes are removed after restoration verification, and owned
production/native servers are stopped after validation.

## Parent comparison verification — 2026-10-22

The parent comparison and runtime-icon ownership repair supersede the performance
and native counts in the previous checkpoint below. The Nuxt app root remains
deferred. The [latest ledger](research/vapor-performance-verification.json) and
[performance diagnosis](research/vapor-performance.md) preserve the scope,
source hashes, raw samples and limitations.

| Check | Latest result |
| --- | --- |
| Standalone native suite, Chromium/Firefox/WebKit | 99/99 passed; no skips, retries or flaky cases |
| Affected production icons, Tree initialization and Pivot worker | 48/48 passed across three engines; no skips, retries or flaky cases |
| Current SSR/hydration, three compiler/parent variants | Default 90/90 and initial-row control 54/54 clean; JavaScript-disabled HTML and hydrated pages |
| Unit suite | 325/325 in 57 files |
| Application, standalone native and canonical Vapor-parent typechecks | All pass with zero diagnostics |
| Affected source lint and three-checkout whitespace checks | Pass; zero lint errors or warnings |
| Four-way performance comparison | 640 default + 384 initial-row-control samples; 400 CPU profiles; 20 remount traces; 28 real scroll runs |
| Retention | All current compiler/parent variants pass; 30 remount cycles per family/variant; no DOM/listener growth from cycle 10 to 30 |
| Fresh native bundle | 242 native UI SFCs; no UI VDOM render imports or icon renderer modules; 443 JS files including the worker, 7,266,413 unminified bytes |

The identical current library is also compiled as VDOM in a disposable copy;
compiled inventories prove that both VDOM controls contain zero native UI SFCs.
The old baseline retains its recorded Tree/Pivot SSR/hydration limitations.
The default and initial-row runs have 144 clean current checks in total, not
192 clean checks including the baseline.

Native-parent profiling exposed a runtime-icon teardown/cached-handler leak
that the mixed-parent checkpoint missed. Public Vue/Nuxt ownership cleanup and
a thirty-remount native regression repair it. Row-construction probes identify
68 initial rows for 10–12 retained rows as a major mount multiplier. The
existing initial-row hint tests that cause without changing library defaults.
The source snapshot covers 1,291 files and stays frozen throughout the final
measurements. Application files and Nuxt configuration also match the start of
this follow-up.

This follow-up reruns the complete native suite and affected production files.
The broader production and visual counts below remain their earlier checkpoint;
they are not presented as fresh runs after the icon ownership change. Final
logs, profiles and archived benchmark assets are retained under
`.cache/vapor-parent-comparison-2026-10-22`; generated benchmark builds, source
copies and large diagnostic heaps are removed, and owned servers are stopped.

## Previous verification — 2026-10-22

Nuxt 4.6.1 and matched Vue 3.6.0-rc.11. The application root remains VDOM
and is deliberately deferred. The [machine-readable verification record](research/vapor-verification.json)
preserves the exact suite scope, source snapshot and final audit results.

| Check | Final result |
| --- | --- |
| Production follow-up, 20 affected files, Chromium/Firefox/WebKit | 295 passed; two existing CDP-only touch-movement capability skips; zero failures or retries |
| Standalone `createVaporApp` consumer, no interop | 96/96 passed across all three engines; no skips or retries |
| Affected visual matrix: desktop/mobile × light/dark × three engines | 24/24 passed; all 24 viewport/component pairs reviewed (48 images), plus three native search-error pairs |
| SSR/hydration performance fixtures, five families × three engines × JS off/on | Current library 30/30 clean; old baseline has 21 clean checks and nine explicitly recorded defects |
| Unit suite | 325/325 in 57 files |
| Tooling guardrail | 4/4 |
| Application and native consumer typechecks | Both pass with zero diagnostics |
| Affected source lint | 324 files; zero errors, 20 style warnings |
| Application/UI/Utilities whitespace checks | All pass |
| Native bundle, final emitted files | 242 UI SFCs compile as Vapor; 443 JS files including the worker, 7,265,884 unminified bytes; no UI VDOM render imports or icon renderer modules |
| Performance comparison | 150 samples; 30 remount cycles per family/renderer; all five current DOM/listener retention gates pass; eight real scroll runs |

This is a fresh **targeted follow-up**, not a claim that a fresh all-files
production sweep passed. The earlier 1,020-case sweep recorded 1,003 passes,
15 failures and two capability skips. Its failures led to observer/hover,
drawer-disposal, startup-readiness and timing-assertion repairs. All affected
files are rerun here, with additional Pivot startup/worker and column-control
accessibility coverage. Application runtime sources stayed frozen during the
final runs; subsequent source edits affected only the native audit harness.

The final native run also supersedes a 93-pass/3-failure audit-delivery run.
The audit initially rewrote JSON after Nitro had indexed its old length,
truncating the HTTP response. It now runs in `nitro:build:public-assets`, after
late asset injection and before the server indexes assets. Its HTTP response
matches the emitted file byte-for-byte; the full 96-case rerun is green.

The visual review found no new overlap, hidden control or theme defect. The
focused narrow editor retains the browser's normal horizontal input scrolling;
WebKit's selection scrolls the visible text. The capped Collapse and all its
diagnostic controls remain usable. These are reviewed captures, not automatically
accepted golden snapshots or full-library accessibility certification.

The [performance report](research/vapor-performance.md) and
[raw samples](research/vapor-performance.json) record mixed timing results and
a 6% larger total gzip asset inventory. Several mounts regress; a universal
speedup is not claimed. Heap tracing repaired Pivot's retained setup initializer;
remounts now keep DOM/listener counts stable. Generated benchmark archives/builds,
the large diagnostic heap and superseded browser artifacts are removed. Owned
test servers are stopped; final raw reports/captures remain under
`.cache/vapor-final-validation-2026-10-22`.

The [native audit](research/native-vapor-audit.md) retains H05 for the deferred
Nuxt root/framework helpers. The [consumer audit](research/vapor-final-contract-audit.md)
maps 115 explicit legacy calls across seven projects; B08/H04 await their rollout.
External checkouts were read only, with no external backend E2E or deployment claimed.
Older sections below are historical checkpoints and retain their original counts.

## Commands

Run commands from the application root. Install dependencies with `bun install`
and Playwright's pinned engines with
`bunx --no-install playwright install chromium firefox webkit`
(on Linux CI, use `install --with-deps chromium firefox webkit`). No workspace
tooling is required.

| Command                                               | Purpose                                                         |
| ----------------------------------------------------- | --------------------------------------------------------------- |
| `bun run test:e2e`                                    | Starts a Nuxt dev server, runs browser tests, stops it          |
| `bun run test:e2e:prod`                               | Builds Nuxt, starts production SSR, runs the same tests         |
| `bun run test:e2e:native`                             | Builds and tests the standalone Vapor consumer in all three engines |
| `bun run test:e2e:visual`                             | Production captures across three engines, desktop/mobile and light/dark |
| `bun run typecheck`                                  | Checks the playground and its imported library source          |
| `bun run typecheck:native`                           | Checks the standalone consumer and library production source   |
| `E2E_BASE_URL=http://127.0.0.1:3011 bun run test:e2e` | Tests an already running server; caller owns its lifecycle      |
| `bun run test:e2e:report`                             | Opens the last HTML report                                      |
| `bun run test:tooling`                                | Tests the local ESLint rule, including generated import aliases |
| `bun run test:run`                                    | Runs existing Vitest tests once                                 |
| `bun run lint`                                        | Reports repository lint findings without changing files         |

Nuxt allows one dev process per checkout. If one is already running, pass its URL
using `E2E_BASE_URL` or stop it before using the managed dev command. Run managed
dev and production suites sequentially: they share generated Nuxt output.
The old `node scripts/test-vapor.mjs [URL]` command delegates to Playwright Test.

Development pre-bundles the 42 imports observed in Nuxt's dependency-discovery
messages and Vite metadata, including the dynamic Table-cell Comark dependency,
Utilities autoimports and development tools. Discovering these in successive
batches after navigation caused `504 Outdated Optimize Dep` and interrupted startup.
This follows Vite's [dependency pre-bundling guidance](https://vite.dev/guide/dep-pre-bundling).
Cold development validation clears the Vite dependency cache before starting
the server. Tests retain their readiness assertions, browser-error checks and
zero-retry policy. Cold lazy-route compilation continues after navigation's load
event: a captured first Pivot hydration took longer than ten seconds. Development
therefore uses a 90-second test / 30-second assertion budget; production keeps
45 seconds / 10 seconds. These limits do not permit browser errors or retries.

The shared renderer diagnostics ignore exactly one harness message: WebKit's
`web-inspector://bootstrap.js` snapshot injection into Nuxt hints' sandboxed
`mb-preview-frame`. The frame intentionally permits no scripts. Console errors
from application sources, browser exceptions and renderer warnings still fail;
the native bootstrap does not include this preview iframe.
Secondary contexts created for SSR, touch or other isolated tests use
`createObservedContext` so their errors and renderer warnings also fail.
Renderer warnings match actual Vue hydration messages and mismatch/completion
diagnostics, not filenames or URLs containing `hydration`. Firefox's ordinary
stylesheet/layout warning remains visible without being misclassified.

Hold-repeat tests install Playwright's clock before navigation and pause it
before pressing. Only `runFor` advances the hold, so real elapsed time between
an assertion and cancellation cannot add an unrequested repeat. Exact model
values and zero remaining release subscriptions are still asserted. See
[Playwright's manual timer guidance](https://playwright.dev/docs/clock#tick-through-time-manually-firing-all-the-timers-consistently).

The fetch-more fixture can hold and release one real page request. This lets
the test finish measuring newly rendered overscan rows before recording its
scroll baseline, without racing the 250 ms API delay. Appending the page must
preserve both the exact scroll offset and the visible row's viewport position.
QueryBuilder path/order tests center their drag targets to keep the intended
drop outside the auto-scroll edge; separate cases exercise auto-scroll itself.
Synthetic paste tests attach their real DataTransfer to the event explicitly:
Firefox otherwise creates an empty clipboard payload. Model/mask assertions
remain exact, with a controlled ClipboardEvent payload.

Playwright uses Chromium, Firefox and WebKit, one worker, no retries, and retains traces,
screenshots and video on failure. Reports are ignored by Git. The initial suite
checks server HTML without JavaScript, hydration, model/slot/event updates,
VDOM Badge interop, unmount/remount, keyboard activation and axe WCAG A/AA checks
scoped to the probe. Browser errors and hydration warnings fail the suite.
Other existing app warnings (for example the missing `/zz` route) remain visible.
This does not certify every optional UI branch or all accessibility. The
standalone consumer's precise coverage and remaining native routing/icon gates
are recorded in the [native audit](research/native-vapor-audit.md).

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

The app uses Vitest 5 with Nuxt Test Utils 4.3.3. The older Test Utils 4.2
environment-export compatibility alias is removed; the upgraded package supports
Vitest 5 directly. The redundant `test.env.NODE_ENV` setting is also removed.

Vue 3.6.0-rc.11's Node/CJS entry does not export Vapor APIs. The config resolves
Vue, its renderers/reactivity and test-utils to their ESM builds and inlines
Vue consumers to preserve one runtime graph. It also sets NODE_ENV=test in
Vite's client environment: happy-dom uses that environment, and Nuxt's inherited
production define otherwise disables setup-ref unwrapping and VDOM stubbing
while the SFC compiler emits development templates. Node dependencies use the
same test mode. Removing the client environment settings and inlined consumers
caused 72 real test failures; retaining the client define without consumer
inlining still broke input models. Keep the alias map as an object so Nuxt's
own aliases survive configuration merging. Recheck these settings on later Vue
and Test Utils releases rather than removing them without regression evidence.

`tests/unit/vapor-runtime.spec.ts` mounts an actual compiled Vapor SFC via
`createVaporApp`, checks events/state/DOM cleanup, and verifies models and scoped
slots through a VDOM owner using test-utils and `vaporInteropPlugin`. Attach to
document for delegated events. Give the test-utils owner a native DOM root;
its root-node traversal does not support a raw Vapor component instance.
This does not replace browser layout or hydration tests.

The complete Vitest suite passes 317 tests across 54 files on the upgraded
runtime. Nuxt's cold environment setup uses a 60-second hook budget and two
workers; this changes framework startup, not assertion timeouts. Two
menu-interaction fixtures now declare the props and model update
event owned by their `useModel` call. The input
fixtures now flush only their pending timers and assert the current 24-year
picker page. Pivot disposal uses a real effect scope; configuration tests check
configuration events separately from Tree's derived metadata updates.

## Steps 1–4 validation — 2026-10-12

Nuxt 4.6.1, matched Vue 3.6.0-rc.11 and Test Utils 4.3.3. The implementation
and configuration stayed frozen during these final runs. Production uses a
saved standalone build, so development compilation cannot rewrite its assets.

| Check | Actual result |
| --- | --- |
| Full production sweep, 81 files / 798 cases | 795 passed; 1 virtual-grid harness failure; 2 capability skips |
| Corrected virtual-grid follow-up | 18/18 passed: both scenarios, three repetitions in every engine |
| Cold development, 20 files | 303/303 passed; no skips or expected failures |
| Standalone native consumer | 36/36 passed; no skips or expected failures |
| Targeted production regressions before the broad sweep | 36/36 passed in all three engines |
| Existing unit suite | 313/313 passed across 54 files |
| Root and native production-source typechecks | Both exit 0; the previous 39 diagnostics are resolved |
| Affected lint | 87 code files, zero errors; 12 existing warnings |
| Tooling and Pivot benchmark validation | 4/4 tooling checks and all 4 benchmark cases pass |
| Root and native builds | Both complete successfully |

The full sweep's sole failure aimed the pointer at column 60's right-edge
resize handle, which was underneath the header's scroll-right button. A captured
WebKit hit test confirmed the button received the press and no resize guide
started. The corrected test centers the column, uses actionability-aware hover,
and requires the guide before dragging. It retains width growth, header/body
alignment, recycling, end-of-grid and remount assertions. All 18 follow-up cases
run against the same implementation build. Across the sweep and follow-up,
all 796 functional production cases are verified; no application failure is
left open by this result.

The two skips are Firefox/WebKit's existing CDP-only native touch-movement
scenario. Real touch taps, touch cancellation, mobile layouts, keyboard and
scoped axe checks run in all three engines. No automatic retries or
expected-failure annotations are used.

The standalone audit includes 241/241 Vapor UI SFCs, 324 readable chunks and
5,639,080 JavaScript bytes. It excludes the VDOM renderer and interop
implementations, but retains createVNode/NuxtLink helpers. Native routing
variants and unknown-at-build-time icons remain concrete H05/I03 gates;
B08's external-consumer audit and the remaining contract/performance audits
are also unfinished. See the [native audit](research/native-vapor-audit.md)
and [corrected 62-family inventory](vapor-components.md).

## In-depth review validation — 2026-10-12

The later [source/API and visual review](research/vapor-review.md) adds explicit
contract and error/disposal regressions to the initial steps 1–4 evidence.

| Check | Actual result |
| --- | --- |
| Full production, 84 files / 885 cases | 883 passed; 2 existing CDP capability skips; zero failures/retries |
| Focused contract verification | 96/96 passed in three engines |
| Final cleanup and stronger state assertions | 153/153 passed in 13 files, three engines |
| Native consumer and rebuilt cleanup follow-up | 45/45 and 15/15 passed, three engines |
| Initial visual matrix | 138 passed; 6 mobile SSR hidden-navigation locator failures |
| Corrected SSR navigation follow-up | 12/12 passed across browser, size and theme projects |
| Open interactive surface matrix | 36/36 passed across all 12 visual projects |
| Rebuilt visual repair matrix | 36/36 passed; circle/drawer geometry and contrast asserted |
| Final unit suite | 317/317 passed in 54 files |
| Root/native typechecks and builds | All exit 0 |
| Affected lint | 217 files; zero errors, 16 style warnings |

Each production run uses a frozen output. Fixture layout, type-barrel and nullish
style cleanup followed the broad sweep; the final follow-ups use rebuilt root
and native outputs. No full-output rebuild runs while its server's tests are
active. Class assertions match complete tokens, so arbitrary UnoCSS variants
containing `.is-open` cannot satisfy an open-state check.

Passing-state screenshots retain both viewport and component crops plus actual
route/browser/viewport/theme metadata. GPT Luna reviews distinct images; only
byte-identical SHA256 matches reuse an existing review. No pixel baseline is
automatically accepted. Theme classes initialize on mount, so no-JavaScript
tests verify SSR content/hrefs while hydrated visual cases verify their theme.
The exact evidence directory is recorded in the review checkpoint; earlier
failed/interrupted runs are retained separately from final results.

## Tabs, scroller and Tree API follow-up — 2026-10-12

`vapor-tabs-accessibility.spec.mjs` exercises manual and automatic activation,
Left/Right wrap, disabled skipping, Home/End, Enter/Space, real Tab/Shift+Tab
focus order, active deletion, dynamic labels/order, isolated IDs, custom label
bindings, overflow, scoped axe and no-JavaScript ARIA/content. Firefox's implicit
overflow-container tab stop is explicitly disabled inside Tabs. Fixture focus
stops are explicit so WebKit's default Tab mode exercises the same sequence.
Existing cache, nested-provider and date/time-pane cases remain strict tests.

`vapor-scroller-contracts.spec.mjs` covers all five former Vertical API stubs
against actual DOM rows and events. Height measurement is read within the same
JavaScript job, before ResizeObserver can supply an unrelated automatic update.
It also checks range invalidation, sticky clear on both scrollers, append,
empty data, disposal/remount, dimensions and Table's alternate-scroller autofit.
Tree's modern options, reactive pixel overscan and custom raw item keys are
checked at runtime; `scroller-contracts.type.ts` rejects Vertical-only and
Tree-owned options during the normal root typecheck.

| Check | Actual result |
| --- | --- |
| Affected production regression, 24 files | 357/357 unique cases verified across the broad sweep and focused follow-up |
| Corrected scroller API follow-up | 21/21 passed in three engines; zero failures/retries/skips |
| Native createVaporApp consumer | 54/54 passed in three engines |
| Desktop/mobile × light/dark visual matrix | 24/24 passed; all 96 state PNGs reviewed by GPT Luna, no visible defects |
| Unit suite | 317/317 passed in 54 files |
| Root/native typechecks and builds | All exit 0 |
| Affected lint | Zero errors or warnings |

The broad sweep passed 356/357 cases. WebKit reached the event output before
its first RAF notification; parsing the still-empty string threw inside the
test's poll callback. The readiness guard now returns undefined until JSON is
present, then retains the exact row-zero/event assertions. All seven scroller
API scenarios were rerun in all three engines (21/21); application sources and
both production outputs stayed unchanged. No application diagnostics were
ignored. The latest result for each of the 357 unique affected cases passes.

Production outputs and 29 affected source/test files are frozen within each
run. Tests use one worker, zero retries and the unchanged strict renderer
diagnostics. Localized navigation links are asserted for both Tabs variants,
both scroller API variants and the vertical Table example. Native tests mount
the real createVaporApp consumer and check its bundle for renderer/interop
implementations; H05's remaining NuxtLink/createVNode path is still separate.

Focused rerun commands (each builds its own owned server unless an external URL
is supplied):

```sh
bun run test:e2e:prod tests/e2e/vapor-tabs.spec.mjs tests/e2e/vapor-tabs-accessibility.spec.mjs tests/e2e/vapor-scroller-contracts.spec.mjs
bun run test:e2e:native
bun run test:e2e:visual tests/visual/api-contracts.spec.mjs
```

Final local evidence uses `/tmp/vapor-api-final-{e2e,native,visual}.json`,
`/tmp/vapor-api-followup-e2e.json` and their HTML report/output siblings.
The consolidated result is `/tmp/vapor-api-final-validation.json`; source hashes
are in `/tmp/vapor-api-source-freeze.json` and its follow-up sibling.
Luna's per-browser screenshot reports use `/tmp/vapor-api-luna-*-report.json`.
The earlier development failures are retained separately; changed implementation
and fixture expectations are rechecked against the final production output.

## Native UI links and runtime icons — 2026-10-12

`vapor-native-links.spec.mjs` tests the real anchor branches in Btn, Chip,
MiniCard, Selector, FilePreview2 and regular/card Tables. Named and localized
routes, query updates, Back/replace, external document navigation, downloads
(including empty/Boolean source filenames), new tabs, modifiers, disabled and
prevented clicks, prefetch and owner replacement use actual browser input.
Whole-row links are accessible siblings of cell links; their independent
pointer/keyboard destinations and JavaScript-disabled SSR markup are checked.

`vapor-runtime-icons.spec.mjs` obtains names over HTTP, outside the build-time
icon manifest. It verifies actual SVG data and paint, currentColor masks,
multicolor/custom SVGs, aliases, legacy class arrays, static asset reuse,
request sharing, offline remount, delayed requests, disposal and provider
failure/recovery. SSR screenshots with JavaScript disabled prove the colored
artwork is painted; hydration retains the same styles without another icon GET.
The provider delay/failure comes from server fixtures, without browser mocks.

| Check | Actual result |
| --- | --- |
| Affected production regression, 46 files / 540 cases | 538 passed; 2 existing CDP capability skips; zero failures/retries |
| Rebuilt main-app menu/links/icons cleanup follow-up | 123/123 passed in three engines; zero skips/retries |
| Native createVaporApp consumer, final cleanup build | 72/72 passed in three engines, zero skips/retries |
| Desktop/mobile × light/dark visual matrix | 24/24 passed; all 96 original PNGs covered by per-browser Luna reviews |
| Real multicolor screenshot pixels | Both fully opaque red/blue bands verified in all 36 original icon captures |
| Unit suite | 321/321 passed in 56 files |
| Root/native typechecks and builds | Exit 0; affected lint has zero errors/warnings |

Visual tests assert a visible whole-row keyboard outline and at least 4.5:1
current-link contrast in both themes. WebKit uses its native Option-Shift-Tab
anchor navigation, as documented in [Safari keyboard shortcuts](https://support.apple.com/guide/safari/cpsh003/mac);
the focus/outline assertions stay identical across engines. An apparent missing
color band in a scaled image preview was checked against the original PNGs:
each contains both fully opaque color bands; the extracted WebKit crop and
pixel report are retained as evidence.

ResizeObserver diagnostics remain strict. Table breakpoint/relative-width and
Scroller content updates use scope-owned frames to avoid ancestor resize
loops. Closed menus stop observing Dialog-entry anchors; open-menu movement
uses one owned frame task, with the redundant trailing throttle removed.
The previously failing Dialog scenario additionally passed ten consecutive
WebKit runs. No application errors or hydration warnings are filtered.

Outputs stay frozen while their servers are tested. The main Nuxt application
bootstrap remains VDOM by request; the standalone native consumer is CSR,
while SSR/hydration checks run against the main production application.
The broad sweep precedes removal of the redundant menu position timer;
the rebuilt 123-case follow-up and 72-case native run cover that final change.
The visual follow-up changes only the Safari keyboard chord; no diagnostic
assertion is relaxed. Source snapshots retain both transitions explicitly.
Its fresh bundle audits all 242/242 UI SFCs, with no UI VDOM render imports,
no Nuxt/Iconify icon renderer modules and no VDOM renderer/interop implementation.
Nuxt framework createVNode/NuxtLink helpers remain; H05 and B08 stay open.
See the [native bundle/cleanup audit](research/native-vapor-audit.md).

Final local reports use `/tmp/vapor-links-icons-final-{e2e,native-cleanup,visual-keyboard}.json`
and their log/output siblings. The rebuilt main-app follow-up is
`/tmp/vapor-links-icons-final-menu-cleanup.json`. Per-browser reviews are
`/tmp/vapor-links-icons-final-luna-*.json`; original paint evidence is
`/tmp/vapor-links-icons-final-paint.json`. Source snapshots use
`/tmp/vapor-links-icons-source-freeze-{final,cleanup}.json`; the consolidated
results and retained audit are `/tmp/vapor-links-icons-final-validation.json`
and `/tmp/vapor-links-icons-native-bundle-final.json`.

## Historical Nuxt 4.6 upgrade validation — 2026-10-11

Nuxt 4.6.1, matched Vue 3.6.0-rc.11 and Test Utils 4.3.3 replace the integration
preview. Root `build` works directly; the orphaned UI Playwright harness and its
missing fixture-directory scripts are removed. Browser tooling runs here.
Template-only native helper imports are explicit because the current Nuxt
autoimport addon handles VDOM `_ctx` lookups rather than Vapor prop lookups.

Frozen-lockfile installation, production builds, affected lint and all 306 unit
tests pass. Typecheck retains exactly the same 39 baseline file/error-code
diagnostics; the existing AsyncMarkdownRow serialization error's wording changes
with the upgraded Nuxt types. It is not a clean typecheck.

The complete production Chromium suite contains 251 cases. Across the broad
sweep and final targeted rebuild, all 250 functional cases pass; Tree's
initial-data hydration assertion remains one expected failure. The broad sweep
exposed a floating-target fixture offset overridden by the generic control
margin reset and a QueryBuilder assertion counting the autofocus selector as a
second editor. Scoped fixture styling and an editor-specific count preserve the
position/cleanup assertions. Both repaired suites pass all eight cases after
the final build.

Development cleanup checks pass across Chromium, Firefox and WebKit: 57 ordinary
passes plus three expected Tree HY01 failures (one per engine). InputWrapper
root variables, empty forwarded-slot hydration and VirtualScroller without its
temporary wrapper pass for native and supported mixed consumers. See the
[upgrade record](research/nuxt-vapor.md) for cleanup and remaining runtime settings.

## Selector migration

`/selector-vapor` exercises the migrated Selector with VDOM and Vapor parents.
Its Playwright scenarios cover controlled/local models, null/undefined,
public clear, search and keyboard focus, custom option keys and slots, remount,
and server HTML without JavaScript. The Vapor parent supplies a frozen initial
lookup to detect accidental mutation. See the [migration record](research/selector-vapor.md)
for the boundary between migrated code and remaining VDOM dependencies.

VirtualScroller delivers content-size changes through a scope-owned animation
frame, outside ResizeObserver's delivery loop. Opening a Selector no longer
resizes its ancestor menu inside that loop. The browser suites retain strict
page-error checks. Firefox's opening-click geometry and pointer re-entry after
returning to a mobile viewport are covered by the MenuProxy regression.

## Input DOM contracts

`tests/e2e/input-prepend.spec.mjs` covers `stackLabel=false`: the empty label starts
after the prepend, floats to the field's left edge on focus or content, and returns
after clearing/blurring. It also changes prepend width, hides/restores it and reloads.
The stacked-label test alone does not cover these two distinct horizontal positions.
The preview deliberately still has a VDOM owner around native TextInput and
InputWrapper components. Its mounted readiness check caught I02's historical
mixed-owner development hydration crash. Vue RC.11 fixes that path, and the
variables have returned to the wrapper root. Run it alongside the native layout
suite, which also verifies marker/menu inheritance, live radius updates and
body-only content styles. Prepend width is measured after slot updates as well
as by ResizeObserver so WebKit's deferred observer delivery cannot shift a filled
label for one painted frame. See the [I02 record](research/input-wrapper-root-style.md).

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

The `?wrapper=true` regression now passes after the Table descendants were
converted to native Vapor. It no longer reproduces the original mixed-renderer
issue I01. The separate `vapor-interop-lifecycle` fixture keeps a real VDOM child
under a Vapor wrapper and verifies that boundary on rc.9.

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
Table/Pivot resize uses the same flush/cancel contract. Its native wrapper test
passes; mixed-renderer cleanup is covered separately by
`tests/e2e/vapor-interop-lifecycle.spec.mjs`.

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

### Tree hydration diagnosis (HY01)

`tests/e2e/vapor-tree-hydration-probe.spec.mjs` isolates the native Vapor
empty forwarded-slot hydration defect from Tree initialization. Vue RC.11
includes the upstream fix: both the empty variant and `?mode=provided` control
must now hydrate without warnings. Child content, following-sibling interaction
and browser exceptions remain checked. Both localized
navigation links and server-rendered variants are checked without JavaScript.
The console matcher targets Vue diagnostics so browser messages that merely
contain the route's word `hydration` do not count as hydration failures.

Tree's original HY01 assertion is now ordinary and strict. Built-in flattening,
sorting and search finish before rendering; custom Promise searches keep matching
pending SSR/first-client states and commit after mount. The initialization suite
checks sorted/filtered/custom/empty SSR, localized navigation, stale async results
and disposal/remount. See the [fix and historical diagnosis](research/tree-hydration.md).

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
measurements and resulting scroll compensation. The actual viewport is now the
component root; the temporary `display: contents` wrapper is removed. A dedicated
VDOM root consumer verifies attributes, layout, focus, scroll events, the public
element ref and remounting, alongside native-owner and JavaScript-disabled SSR
checks. Its localized `?mode=vdom` navigation entry is tested too.

Row measurements use TanStack's
[animation-frame ResizeObserver delivery](https://tanstack.com/virtual/latest/docs/api/virtualizer#useanimationframewithresizeobserver)
because growth/shrink updates otherwise produce a WebKit observer loop. The
failure also reproduced with the old wrapper restored. This deliberately defers
measurement by one frame; it is a targeted loop fix, not a general performance
optimization. Existing growth/shrink/clear/remount checks retain their browser
error assertions.

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
The historical I01 wrapper-disposal and HY01 Tree-initialization diagnostics are
separate from the scroller conversion; see their current migration status.

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


## Native Table measurement

`bun run test:run tests/unit/vapor-table-measurement.spec.ts` mounts the real
measurement SFC with `createVaporApp` and no `vaporInteropPlugin`. It checks
local injection, concurrent native slots, disposal and cancellation. DOM width
is supplied by a geometry spy because happy-dom has no layout engine; real
geometry is checked by `tests/e2e/vapor-table-measurement.spec.mjs`.

The browser example `/cs-CZ/vapor-table-measurement` exercises actual Table
cells and double-click autofit; `?mode=autofit` also covers initialization after
hydration. The suite checks SSR without JavaScript, localized navigation,
reactive slot content, error cleanup and removal during autofit. Visible row-slot
children must also dispose on removal and remount correctly. I04's expected-failure
marker was removed after upgrading Vue to rc.9 and verifying that cleanup.

At the D07 checkpoint on rc.7, production Chromium passed 22 functional tests
across this suite and `vapor-table-pivot-dom.spec.mjs`, plus the I04 expected
failure. Firefox passed all 4 measurement tests. WebKit met the same functional
assertions but 2 tests failed on the existing ResizeObserver loop diagnostic;
it is not filtered out.
These results prove the measurement path, not native-only operation or bundle
independence of the entire UI library.

## VDOM child cleanup under a Vapor wrapper

`tests/fixtures/interop-lifecycle` preserves I01's original renderer boundary:
a native Vapor `div v-if` contains an intentionally VDOM child. The `direct`
variant removes the component itself and acts as the control. These diagnostic
components do not adapt any UI component or change its renderer.

`tests/unit/vapor-interop-lifecycle.spec.ts` uses Vue's interop plugin explicitly.
Both variants check `onBeforeUnmount`, `onScopeDispose` and `onUnmounted`, a real
window listener, repeated hide/show cycles and whole-app unmount with a live
child. Both pass on the matched rc.9 packages. Keep the native slot suite below
separate so its no-interop guarantee remains intact.

`tests/e2e/vapor-interop-lifecycle.spec.mjs` exercises the same boundary after
SSR/hydration and a subsequent client remount. Event sequences prove that each
child is disposed exactly once and a removed listener cannot fire. The SSR
case verifies empty initial event logs without JavaScript, plus both localized
navigation links: `/cs-CZ/vapor-interop-lifecycle` and `?mode=direct`.
Client navigation checks both variants too; `app.vue` intentionally remounts
examples when `mode` changes, so each navigation starts a fresh event log.
The existing Table wrapper-removal, resize-cancellation and ripple tests cover
the real UI consumers alongside this minimal runtime diagnostic.

Validation (2026-09-29, rc.9): all 6 focused unit tests passed (2 interop and
4 native slot controls). The production build and affected-code lint passed.
All 24 production browser checks passed: 4 interop, 2 Table and 2 ripple cases
in each of Chromium, Firefox and WebKit. Development Chromium also passed the
removal/remount, SSR, ripple and Table checks; the first cold Table load exceeded
the test timeout and both Table cases passed after the server was warm.
Typecheck retains exactly the same 42 diagnostic lines as the F09 baseline.
At that checkpoint I01 was closed, while I02 and I03 remained separate blockers.
The Nuxt 4.6 / RC.11 upgrade closes I02; native icon support remains open.

## Native fallback-slot lifecycle

`tests/unit/vapor-slot-lifecycle.spec.ts` mounts a small tree with `createVaporApp`
and no interop plugin. It checks four slot arrangements across repeated hide/show
cycles and whole-app unmount, including lifecycle hooks and a real window listener.
Only the empty forwarded fallback fails on rc.7; all four pass on rc.9, which
includes [Vue's owner-scope disposal fix](https://github.com/vuejs/core/pull/15524).

`tests/e2e/vapor-slot-lifecycle.spec.mjs` runs the same tree after SSR/hydration and
checks deterministic server HTML without JavaScript. The default route reproduces
the empty forwarded slot; `?mode=provided` supplies content. Both are in localized
navigation. `?mode=static` and `?mode=direct-fallback` provide additional controls.
Run it together with `vapor-table-measurement.spec.mjs` to cover the real Table.

On rc.9, those 10 focused checks pass in development and production Chromium
and production Firefox. Production WebKit passes all 5 minimal lifecycle checks
and the real Table-removal regression. Its two measurement failures are still
only the existing ResizeObserver diagnostic at the final error assertion; their
cleanup, cancellation, widths and remount assertions pass.

At the I04 checkpoint, the rc.9 full unit run had 276 passing tests and the same
24 input-component
failures reproduced on rc.7. Those older `useInputUtils.spec.ts` tests use a VDOM
test-utils mount without installing Vapor interop. The rc.7 comparison has one
additional failure: the new fallback regression. This unit-harness backlog was
separate from the successful native-only cases; F09 resolves it below.

At the I04 checkpoint, the broader rc.9 production Chromium run covered 60 cases
across these two suites,
Table/Pivot DOM, Tabs, scopes, input layouts, overlays, virtual scrolling, Tree,
TextInput and date/time inputs. It has 56 functional passes, the existing HY01
expected failure, and 3 DatePicker interaction failures. The aggregate reporter
counts HY01 among its 57 passes. All 3 date-picker failures reproduce on an rc.7
production build with the same application code; see I05. Production build and
affected lint pass, and typecheck retains the same 42 baseline diagnostics.

## Picker focus and click lifecycle

`tests/e2e/picker-touch-focus.spec.mjs` covers DateInput, TimeInput and ColorInput
with both desktop mouse and touch input. Each desktop case checks that the first
click focuses the input and leaves its popup open and hit-testable, later clicks
toggle it, and holding the mouse down until the popup opens does not make the
release dismiss it. A real picker selection must update the model. All three
desktop cases fail against the production build before I05's shared-handler fix.

The existing touch cases check input/label/accessory activation without editable
focus at 390px and 1100px, keyboard focus, programmatic focus and mobile time
editing. Chromium also checks that scrolling from an input does not open it;
that case uses CDP touch events and is explicitly skipped in Firefox and WebKit.
Firefox uses a touch-enabled narrow viewport without unsupported `isMobile`.
WebKit's six touch-focus cases also fail before I05: its touch-generated click
reports `pointerType="mouse"`, which previously bypassed the helper's touch
history and restored editable focus. They remain ordinary tap/focus assertions
and exercise the corrected click classification.

Run this suite alongside `tests/e2e/vapor-date-time-inputs.spec.mjs`. The latter
checks localized masks, public selection, slots/remount, no-JavaScript SSR,
mobile time editing, month/year grids and day selection. Its public-select flow
asserts that selection has focused the input and opened the menu before clicking
a day; an extra input click at that point would intentionally close the popup.
`useInputUtils.spec.ts` also checks the shared focus/click contract for both
`pointerdown` and `mousedown` bindings in its `input menu interactions` group.

At the completed I05 checkpoint on rc.9, production Chromium passes all 39 cases
across these two suites and the value, icon, file, dynamic input, DOM API,
anchor, layout, mask and DatePicker-event regressions. Production Firefox and
WebKit each pass all 15 applicable cases in the two picker suites, with one
Chromium-only scroll case skipped per browser (30 passes, 2 skips combined).
The two focused shared-helper unit cases, affected lint and production build
pass. Typecheck reports the same 42 diagnostics as I04, compared verbatim.
The previously recorded 24 legacy input-component unit failures remained a
separate harness backlog at that checkpoint; the full unit suite was not rerun
for I05. F09 resolves that backlog below.

## Native input component unit tests

`bun run test:run packages/UI/app/components/Inputs/functions/input-components.spec.ts`
runs 25 cases through `createVaporApp`, without `vaporInteropPlugin` or a VDOM
test-utils mount. The compiled fixtures live in `packages/UI/tests/fixtures`.
They preserve the original unit isolation with native InputWrapper, button and
day-cell stubs; real layout, overlays, button and calendar-cell behavior remains
covered by browser tests. No application component or runtime patch is required.

The 24 migrated cases retain local/one-way input editing, external prop updates,
numeric paste, currency beforeinput, textarea emissions, locale changes during
partial date editing, typed/pasted compact dates, Delete/Backspace behavior and
calendar month/year/disabled-date checks. A new controlled numeric case verifies
one emission for a typed edit and no additional emission when the parent accepts
or replaces it. Uncontrolled tests deliberately have no update listener, because
adding one alongside a model prop would change the ownership being tested.
Calendar checks retain native transitions and wait for the leaving grid to go.

The 23 passing shared-helper cases stay in `useInputUtils.spec.ts`, including
VDOM SSR/hydration and both pointer/mouse menu handlers. These plain VDOM hosts
test the reusable helper's compatibility; they do not wrap native UI components.
The explicit consumer-interop test remains in `tests/unit/vapor-runtime.spec.ts`.

The full suite passes with `bun run test:run --maxWorkers=2`: 51 files and
302 tests, with no skipped or expected-failure cases. The initial unrestricted
run passed 256 tests but nine Nuxt suites hit their 10-second setup-hook timeout
before running 46 tests. Limiting workers to two resolved that startup contention
without changing timeouts, tests or application behavior. Affected lint passes.
Typecheck reports the same 42 baseline diagnostics as I05, compared verbatim.

## 2.3 synchronization (2026-10-11)

The merge of UI `a8c76e10` and Utilities `0fae53d` preserves the native Vapor
regressions removed on `2.3`. New cases cover XS cell drafts (Enter, blur,
Escape and one commit), exact tiny/large numbers, async row-save rejection and
retry, Tree search collapse state, drag permissions and scroller content resize.
The query variants in localized navigation are checked alongside no-JavaScript
SSR.

The 37 affected production Chromium suites contain 143 cases. Across the broad
run and focused repairs, all 141 functional cases pass; two existing HY01
hydration assertions remain expected failures. The final build and focused run
pass 33 cases (31 functional, 2 HY01). The merge initially left Tree/TreeDms SSR
rows empty because their new visibility watcher did not run during async server
initialization; a cached computed value preserves node reuse and SSR content.
Editor focus also handles a custom native input root. Fixture actions now match
double-click editing, the required scroll axis, Tooltip outside-click dismissal,
and the drag ghost's auto-scroll edge zones.

All 304 unit cases in 52 files pass. Four Nuxt setup hooks timed out in the
two-worker run; all 20 affected cases passed when those four files ran alone
with one worker. Affected source lint has no errors and 16 warnings. The UI
manifest retains 21 pre-existing key-order/duplicate-key lint errors; the new
dependency does not add another. Typecheck retains 39 baseline
diagnostics, down from 42 after three fixture fixes, with no new file/error-code
diagnostics. These checks do not close the remaining migration gates in the
[checklist](vapor-migration.md).
