# Measured Tree, Pivot and Table tuning — 2026-10-25

One source improvement is retained after isolated native trials and the
corrected combined comparison. The duplicated static Tree root, deferred
prefetch and Table slot experiments were reverted because their native gains
were not stable. Captured row-key preparation, including a simpler lodash-accessor version,
was also reverted. Pivot cell inlining failed final replication and was reverted
too. Pivot and Table keep their original implementations.
The Nuxt application root remains deferred.

[Corrected samples, source hashes, decisions and profiles](vapor-performance-tuning.json) ·
[latest verification ledger](vapor-mount-verification.json) ·
[HTML migration assessment](vapor-migration-status.html).

## Latest corrected comparison

Median Chromium warm mount to requested DOM content and layout, milliseconds. Each
before/after source is compiled as both VDOM and Vapor. No initial-row hint,
dataset truncation, feature removal or native-only caching is used.

| Family | Native before | Native after | VDOM after | Paired native change [95% interval] |
| --- | ---: | ---: | ---: | ---: |
| tree | 9.80 | 8.40 | 6.90 | -1.40 [-1.65, -1.20] |
| pivot | 17.50 | 17.50 | 15.70 | 0.15 [-0.30, 0.45] |
| table | 9.50 | 9.30 | 8.30 | -0.20 [-0.30, 0.00] |

Full corrected control, median / p95 milliseconds:

| Family | VDOM before | Vapor before | VDOM after | Vapor after |
| --- | ---: | ---: | ---: | ---: |
| table | 8.30 / 9.20 | 9.50 / 10.30 | 8.30 / 9.30 | 9.30 / 10.60 |
| tree | 8.50 / 10.80 | 9.80 / 13.40 | 6.90 / 8.00 | 8.40 / 9.40 |
| pivot | 15.70 / 19.70 | 17.50 / 21.60 | 15.70 / 18.40 | 17.50 / 21.20 |
| selector | 3.30 / 5.00 | 3.50 / 5.20 | 3.20 / 5.00 | 3.40 / 5.40 |
| scroller | 1.00 / 1.20 | 1.10 / 1.40 | 1.00 / 1.90 | 1.10 / 1.70 |

Pivot, Table, Selector and standalone scroller have unchanged implementations
and provide additional controls; their full results are included. These are lab
component mounts rather than page-load or application readiness measurements. A smaller absolute mount cost can coexist
with a larger percentage gap when the VDOM control improves more.

## Final implementation

- Tree stores its replaced search-result list in a shallow ref. Immutable
  derived wrappers no longer acquire deep proxies; original item reactivity
  and explicit reactive collapse metadata remain. Nested edits must publish
  the model array to rebuild label/search snapshots; this existing behavior
  is tested for built-in and custom search across remounts.
- Pivot keeps the original value-cell component. Row-owned cells showed a
  provisional gain, but final corrected replication was 15.40 → 15.50ms,
  paired interval −0.25 to +0.30ms, with neither block improving. The entire
  refactor and shared helper were removed. Expanded public cell formatting,
  locale, sizing and interaction tests remain.
- Table retains its original row and shared-scroller implementations. The
  slot proposal failed replication. Captured key preparation was simplified
  to a standard lodash accessor, then rejected because one Table block was
  flat and native scroller results were inconclusive. No more special cases
  were added to chase parity. Its existing mount overhead remains an open
  performance tradeoff, with slots, editing, card views, scroll and cleanup
  tested on the retained implementation.

## VDOM control correction

Marker removal alone left Button/Chip importing Vapor directives. The current
control generator selects the existing VDOM ripple export and adapts Button's
root assignment/disposal to VDOM lifecycle hooks. All other component logic,
data and settings stay matched. Original and prepared hashes, compiler output,
typechecks and real ripple/update/remount checks validate the controls.
Earlier VDOM timings and ratios below are superseded by this corrected run.
Isolated native A/B observations remain diagnostic evidence; final retention
uses the corrected combined results above.

Separate sampling identifies shared work in Table's virtualizer measurement,
reactive/prop access and geometry; Pivot still performs aggregation, index/data
construction and virtualization in both renderers. These instrumented samples
do not apportion the full native/VDOM gap to one function or prove an upstream
limit. The proposed cell, key and slot changes failed final replication rather
than earning additional special cases.

The canonical fixture is unchanged. Both benchmark roots remain Nuxt VDOM
bootstraps; the measured owner uses its requested renderer. Main application
root conversion is not part of this work.

## Verification and scope

| Gate | Result |
| --- | --- |
| Production E2E, 31 files / three engines | 481 passed; 2 existing CDP skips; final complete rerun, no retries or flaky cases |
| Complete standalone native suite | 111/111, no skips or retries |
| Unit logic / benchmark tooling | 344/344 in 61 files; 8/8 Node tooling checks |
| Types | App, native, benchmark Vapor, corrected before/after VDOM: zero diagnostics |
| Affected lint / whitespace | 25 files clean; all three checkout whitespace checks pass |
| Corrected performance matrix | 1,280 samples; 120 SSR/hydration, 60 DOM parity and 12 directive interaction checks |
| Memory and scroll | 30 GC remount cycles per family/variant; no retention failures; 16 real scroll runs |
| Separate diagnosis | 240 CPU profiles, 12 five-remount traces and 28 DOM construction probes |
| Final native bundle | 242 native SFCs; zero UI VDOM render imports or Nuxt/Iconify renderer modules; 443 JS files / 7,280,762 unminified bytes |

The original broad run recorded 480 passes, 2 skips and one Chromium Tree
drag test setup failure: an earlier outside drag had recycled the next source
row. The test now restores the virtual viewport before locating that row.
Its complete 33-case file passed across all three engines; the failing case
also passed five consecutive Chromium runs. The final full 31-file rerun passed
481 cases with two existing skips. Original results and
failure artifacts are retained. No assertions, timeout budgets or product
behavior were changed to resolve this test setup issue.

The 64 paired trials rotate variant order and are checked in two blocks.
Confidence intervals use 10,000 deterministic bootstrap resamples of paired
median differences. They are diagnostic intervals on a shared machine, not
field guarantees. Owned builds, suites, typechecks and profiling are idle for
the latency run. Profiling and row interception run separately.

Final gzip inventories: VDOM 968,001 bytes;
Vapor 993,715 bytes. This inventories emitted
JS/CSS, including lazy chunks, rather than initial transfer. The standalone
native audit is a separate eager, unminified build. It retains framework
createVNode helpers while excluding VDOM renderer/interop implementations.

Source: 1305 files, SHA-256 `47405c7bf3036cb3ddfa6abfac1c0454e2a751f5d9691ae82581c0559a10cef8`.
Recovery archives, frozen inputs/maps, raw traces and browser artifacts are in
`.cache/vapor-row-tuning-2026-10-25`. The report links portable summaries.
Temporary layer copies and four generated benchmark outputs were removed after
the frozen archive was checked against all 30,556 archived files. Restore with
`tar -xzf .cache/vapor-row-tuning-2026-10-25/frozen-inputs.tar.gz -C .cache/vapor-row-tuning-2026-10-25`.
The final manifest is `combined/experiment.json`; rebuild each of its four
variants with `VAPOR_PERFORMANCE_EXPERIMENT` and
`VAPOR_PERFORMANCE_RENDERER`, then run `tooling/performance/run.mjs`
with the same experiment environment and an explicit
`VAPOR_PERFORMANCE_REPORT`. Start its four production servers on the manifest
ports; run profiles/row probes separately. New snapshots can use
`prepare-experiment.mjs <name> before|after` with
`VAPOR_PERFORMANCE_EXPERIMENT_DIRECTORY`; the default directory is generic.
Library conversion remains 242/242 across 63 families. Remaining migration
completion work is the deferred Nuxt root (H05) and external consumer
rollout/authenticated E2E (B08/H04). Workload-specific performance budgets and
automatic deep Tree metadata refresh are separate follow-ups.

## Earlier viewport round — 2026-10-25 (historical)

The freshly synced code reproduced the Table, Tree and Pivot regressions.
Fresh client mounts constructed the large SSR estimate before the viewport
was connected, then discarded most rows. The shared scroller now starts from
its measured client viewport. Server rendering and hydration retain populated,
deterministic estimates and the existing initial-count API. Both compilers
benefit; a smaller native overhead remains.

[Before/after samples and profiles](vapor-performance-mounts.json) ·
[verification ledger](vapor-mount-verification.json) ·
[HTML migration assessment](vapor-migration-status.html).

## Fresh before/after comparison

Median time to requested DOM content and forced layout, milliseconds. Every
VDOM/Vapor pair uses the same per-stage source, data, props and settings.

| Family | VDOM before | Vapor parent before | VDOM after | Vapor parent after |
| --- | ---: | ---: | ---: | ---: |
| table | 21.4 | 29.4 | 9.3 | 10.3 |
| tree | 22.0 | 28.8 | 9.2 | 11.1 |
| pivot | 29.7 | 34.9 | 16.1 | 17.5 |
| selector | 3.7 | 3.9 | 3.5 | 3.8 |
| scroller | 2.2 | 2.4 | 1.2 | 1.3 |

Final four-way control, median / p95 ms:

| Family | Archived 2.3 VDOM | Current VDOM | Vapor / VDOM parent | Vapor / Vapor parent |
| --- | ---: | ---: | ---: | ---: |
| table | 19.8 / 23.7 | 9.3 / 11.5 | 10.5 / 15.0 | 10.3 / 12.1 |
| tree | 20.9 / 33.5 | 9.2 / 18.3 | 11.6 / 18.7 | 11.1 / 16.6 |
| pivot | 25.2 / 34.6 | 16.1 / 19.1 | 17.7 / 28.9 | 17.5 / 24.5 |
| selector | 4.5 / 5.1 | 3.5 / 4.0 | 4.0 / 4.6 | 3.8 / 4.3 |
| scroller | 1.9 / 2.4 | 1.2 / 1.4 | 1.4 / 1.8 | 1.3 / 2.4 |

The native improvements are real source optimizations, not proof that Vapor
is faster than the same optimized source compiled as VDOM. The unchanged
archived control also varies between runs on this shared machine; raw timings,
load averages and distributions remain in the linked evidence.

## Changes and attribution

- Fresh client scrollers use a zero initial rectangle until TanStack observes
  their connected viewport. SSR and actual hydration retain the existing row
  and column estimates. This removes provisional row and cell creation without
  a fixed short viewport assumption, blank server HTML or dataset truncation.
- Table forwards supplied field/row slots instead of manufacturing empty
  forwarding functions for every column. Conditional consumer slots still
  restore their formatted fallback; autofit, editing, links and slot payloads
  remain covered.
- Known Tree leaves retain their configured button and icon dimensions through
  the existing class-only icon path, without mounting an invisible runtime icon.
  Missing children remain unknown under the documented default contract, and
  lazy/unknown expand controls remain. The timing fixture keeps that default;
  this separate leaf optimization is not used to manufacture its speedup.
- A collapse button stops Enter from reaching Tree's global selection handler,
  allowing normal native button activation. The new three-engine test catches
  this keyboard collision while replacing a leaf with a parent and back.
- The benchmark tsconfig no longer references one variant's deleted generated
  directory. Each variant builds independently; its generated app project is
  typechecked explicitly. After building the variant, use
  `bunx --no-install vue-tsc --noEmit -p tooling/performance/.nuxt/vapor-parent/tsconfig.app.json`.
  The row probe now includes both Pivot panels/cells.

The row-construction probes now create and retain exactly 10 Table rows,
12 Tree/scroller rows, and 24 Pivot row nodes / 48 value cells in this fixture.
Before-change current Table/Tree/scroller probes constructed 68 rows each.
The final archived 2.3 Pivot control constructs 120 rows and 420 cells before
retaining 24 / 48; this is an archived-control observation, not a recorded
before-change current Pivot count.

Separate CPU profiles and five-remount traces attribute the former excess to
row/slot/prop/effect construction and measurement. Remaining work includes
shared data transformation/virtualizer preparation and distributed renderer
setup; layout does not explain a large remaining native gap. Sampling and
tracing add overhead and are not used for the latency comparisons.

The final diagnostic profiles also explain most of the residual gap. Sampled
self time in Vue core/DOM/Vapor runtime functions is higher for native rows;
layout time is nearly the same. These are separate instrumented observations,
not substitutes for the uninstrumented mount medians.

| Family | VDOM runtime self ms | Vapor runtime self ms | VDOM layout ms | Vapor layout ms |
| --- | ---: | ---: | ---: | ---: |
| Table | 2.66 | 3.35 | 0.947 | 0.951 |
| Tree | 1.36 | 2.92 | 0.227 | 0.215 |
| Pivot | 2.30 | 3.77 | 0.640 | 0.730 |

Runtime self time is the sum of non-overlapping samples per mount across 20
CPU profiles; layout is the median of five traced mounts. Native prop access,
effect and row/slot setup remain tuning opportunities. Matching VDOM latency
has not been achieved.

## Method and verification

The archived baseline is now UI 2.3 through 47fbf0c5 and Utilities through
88ea6b3. All variants use installed Nuxt 4.6.1 / Vue 3.6.0-rc.11 and one
unchanged canonical fixture. The current VDOM copy removes only 246 SFC compiler
markers (242 UI + four Utilities); hashes verify it matches the live layers.
Build audits verify zero native UI SFCs in VDOM controls and all 242 in both
native controls. The Nuxt outer root is VDOM throughout; creation of the parent
bridge is outside the timed remount subtree. The Nuxt application root is deferred.

Each full run uses 2,000 records, five warmups and 32 measured trials per
family/variant, rotating first variant: 640 samples before and 640 after. An
intermediate 640-sample run is retained separately. No special initial-row hint
is applied. Content readiness includes the requested label/revision in real
DOM and layout; async publication is included. Commit, flush, settled, update,
remove and per-cycle remount timings remain available.

Before/final diagnosis includes 480 CPU profiles and 24 traces, with another
240 / 12 retained for the intermediate candidate. Row interception and all
profiling run outside timing. Owned builds, browser suites and typechecks are
idle during latency collection. This is a shared development machine with no
CPU throttling, not a field-performance or long-running soak guarantee.

| Check | Result |
| --- | --- |
| Current SSR/hydration, three engines | 90/90 per full timing run; archived 2.3 retains nine explicitly recorded Tree/Pivot limitations |
| Production E2E, 30 files / three engines | 460 passed, 2 existing CDP capability skips; zero failures, retries or flaky cases |
| Standalone native E2E | 102/102, no skips or retries |
| Unit logic suite | 344/344 in 61 files |
| Types | Application, native consumer and canonical performance parent: zero diagnostics |
| Affected lint / whitespace | 12 files, zero errors or warnings; all three checkout whitespace checks pass |
| Final memory/scroll | 30 remount cycles per family/variant; all current DOM/listener retention gates pass; 16 real scroll runs |
| Native bundle | 242 native UI SFCs; zero UI VDOM imports / Nuxt-Iconify renderers; 443 JS files / 7,275,938 unminified bytes |

New browser cases cover populated default SSR/hydration; a 2,800px viewport,
hide/show and repeated client remounts; live conditional Table slots; known-leaf
button sizing, new children, keyboard activation and restoration. Both new
localized variants are linked and followed with JavaScript disabled.

The bundle inventory counts every emitted JS/CSS file, including lazy chunks,
with per-file gzip; it is not initial page transfer. Final gzip inventory: archived 2.3 937,135 bytes, current
VDOM 967,806, Vapor parent 993,663: +2.7% against
the same optimized source, +6.0% against archived 2.3. The mount fixes change
the native inventory by just 100 bytes. The standalone audit eagerly
imports all UI components and is unminified. Framework createVNode helpers remain,
while the native consumer installs no VDOM renderer or interop implementation.

Final source: 1295 files, SHA-256
`32363f9d1f6c6e738ca3446b2821907338fd7fc1a9bddcd3485e69654b0cd05e`. The ledger states its hash serialization method
and the earlier sync snapshot separately. Recovery, logs, raw profiles, frozen
production maps and browser artifacts remain under
`.cache/vapor-mount-fix-2026-10-25`. External consumer rollout remains B08/H04;
the Nuxt app root remains H05.

A separate cold-cache Tree reload in Chrome 155 observed heading LCP 289ms,
TTFB 94ms and CLS 0. The hydrated page showed 12 rows and no console errors or
warnings. Render-blocking insight estimated zero LCP savings. This is a lab
heading/page-load check, not component mount or hydration readiness; the
MCP-managed trace summary and insights are saved in `cold-tree-evidence.json`
under the evidence directory above.

## Historical diagnosis — 2026-10-22

The following records the earlier source snapshot and is superseded by the
fresh measurements above. Its old baseline, hint controls and counts remain
historical evidence.

The Vapor parent removes part of the mount cost. The larger multiplier is the
initial virtualization estimate: a 320px panel first constructs **68 rows** and
then keeps only 10–12. The current native row/slot implementation costs more to
create than the same current UI compiled as VDOM; temporary rows amplify that
cost on every remount. A separate native-parent icon-data retention bug was
found and fixed. The Nuxt application root is still deferred and unchanged.

[Raw measurements and profile summaries](vapor-performance-parent.json) ·
[verification ledger](vapor-performance-verification.json) ·
[previous 150-sample checkpoint](vapor-performance.json).

### Controls and measurement

| Variant | Library | UI compiler | Measured parent |
| --- | --- | --- | --- |
| `vdom` | Archived 2.3 | VDOM | VDOM |
| `current-vdom` | Current source in a disposable copy | VDOM | VDOM |
| `vapor` | Current source | Vapor | VDOM |
| `vapor-parent` | Current source | Vapor | Vapor |

All four use one canonical `Benchmark.vue`. Its parent compiler is selected
at build time, rather than maintaining separate templates. Build-time audits
verify **zero native UI SFCs in both VDOM controls and all 242 UI SFCs compiled
natively in both Vapor variants**. The current VDOM copy removes only compiler
markers, including eight empty setup blocks omitted by compiler-sfc's block
descriptor. Its original source hashes are checked against the live layers.
Production UI sources keep their Vapor markers.

The baseline pins UI `ad740a61190e7b1961386982da03f8a1d2a5e4e8` and Utilities
`35b19e8db4bd95e9eafbed4a0744944b96301788`. Its partial Pivot pilot is compiled
as VDOM. Every variant uses the same installed Nuxt 4.6.1 / Vue 3.6.0-rc.11.

- Identical 2,000 records, props, Arial, and 1280 × 900 browser viewport.
  Component panels are 320px high; Table headers/footer leave room for ten rows.
  Table has three columns; Pivot groups into 20 value columns. Selector measures
  the closed control and option replacement, rather than an open 2,000-item menu.
- Five warmups, then **32 trials per family/variant**. Variant order rotates so
  each appears in every order position eight times. Default workload: **640
  samples**. Initial-row control: **384 samples** across Table/Tree/scroller.
- Each sample measures a real remove, fresh mount, and 2,000-record replacement.
  Mounts are component re-creations in an already loaded page; assets are loaded
  before timing. These are neither cold page-load nor hydration timings.
- Content-ready waits for the requested label/update in actual DOM and forces
  layout. Missing content is polled on animation frames, so async baseline Tree
  and Pivot timings include observation/scheduling delay. Flush, commit, final
  forced-layout and two-frame settled values remain in the raw data. Commit
  includes work inside callbacks, including their own forced layouts.
- Memory checks force GC after unmount and sample cycles 0/10/20/30. All current
  variants must keep DOM/listener counts stable from cycle 10 to 30. Each of
  those remounts also records its latency. Heap readings include runtime caches.
- **400 CPU profiles**, 100µs sampling, and **20 traces** of five remounts each
  run separately from timing. Row-construction probes also run separately: DOM
  creation/cloning plus mutation observation count detached and inserted rows.
  No profiler or DOM interception runs during the latency comparison.

Timing uses Chromium 151.0.7922.34 on an Apple M2 Pro, ten logical CPUs, 32 GiB,
macOS kernel 24.6.0, with no throttling. Owned builds, browser suites and
typechecks were idle during measurements. This remains a shared development
machine; load averages are recorded. Small differences and p95 tails are not
field-performance guarantees. Medians average the two central samples; p95 is
nearest-rank. Source snapshot: **1,291 files**, SHA-256
`e27f19fc94495682686cd4bf27873c6c57ade1827ab648bf622ef137a90b9811`. All runtime and harness sources stayed unchanged during
the final measurements; application files and Nuxt configuration also match
the start of this task.

### Default mount results

Time until requested DOM content is observed ready, **median / p95 ms**:

| Family | 2.3 VDOM | Current VDOM control | Vapor / VDOM parent | Vapor / Vapor parent |
| --- | ---: | ---: | ---: | ---: |
| table | 17.6 / 20.5 | 18.9 / 22.8 | 29.6 / 35.4 | 27.2 / 34.0 |
| tree | 17.8 / 25.2 | 19.8 / 28.5 | 25.8 / 31.6 | 25.4 / 29.9 |
| pivot | 25.3 / 29.0 | 24.4 / 27.9 | 30.9 / 34.9 | 29.5 / 33.4 |
| selector | 6.3 / 12.8 | 4.5 / 5.4 | 5.4 / 7.3 | 5.3 / 6.3 |
| scroller | 3.2 / 3.9 | 3.5 / 4.4 | 4.1 / 5.3 | 3.5 / 4.3 |

Changing the parent helps Table by about 2.5ms and the scroller by about 0.7ms
in this run. It does not remove the Table/Tree/Pivot gap against the current
VDOM control. Current VDOM versus native-parent Table is about 18.9 versus
27.2ms; Tree is 19.8 versus 25.4ms. This same-source control separates native
execution costs from the old library's behavior changes.

Update medians, ms:

| Family | 2.3 VDOM | Current VDOM control | Vapor / VDOM parent | Vapor / Vapor parent |
| --- | ---: | ---: | ---: | ---: |
| table | 3.2 | 3.3 | 3.5 | 3.3 |
| tree | 10.2 | 5.0 | 5.6 | 5.6 |
| pivot | 14.2 | 14.7 | 13.6 | 14.8 |
| selector | 4.2 | 3.2 | 2.9 | 2.9 |
| scroller | 1.3 | 1.5 | 1.4 | 1.3 |

Tree/Selector updates improve against the old library, but a universal Vapor
speedup is not established. All raw remove and settled phases are retained.

### Initial row estimate is the main mount multiplier

`VirtualScroller` initially estimates `ceil(2160 / rowHeight)` rows.
For 32px rows this creates 68. The benchmark panels subsequently measure their
actual height and discard 56–58 rows. Direct DOM instrumentation confirms the
same counts in **all four renderer/parent combinations**; it found no extra
native-only duplicate row construction.

The control passes the existing `initialRowsRenderCount: 12` option through
Table/Tree scroller configuration and the standalone scroller. It keeps all
2,000 input records, final viewport rows, dimensions and other props unchanged.

| Family | Constructed rows, default → hint | Final visible/overscan rows | Current VDOM, default → hint ms | Native parent, default → hint ms |
| --- | ---: | ---: | ---: | ---: |
| table | 68 → 12 | 10 | 18.9 → 11.4 | 27.2 → 12.5 |
| tree | 68 → 12 | 12 | 19.8 → 9.7 | 25.4 → 11.5 |
| scroller | 68 → 12 | 12 | 3.5 → 2.2 | 3.5 → 2.1 |

The remaining current-VDOM/native-parent differences with the smaller estimate
are about 1.2ms for Table and 1.8ms for Tree. The scroller is effectively matched
at this scale. This demonstrates a concrete tuning option for fixed-height
panels; **library defaults were not changed**. Both default and controlled
workloads remain reproducible. A global twelve-row default would also change
initial SSR coverage for larger panels, so the diagnostic is not a universal
replacement policy.

Pivot has two virtualized panels. Across all four variants the probe records
**136 row nodes constructed → 26 retained**, and **476 value cells constructed
→ 52 retained** after viewport measurement. This is further temporary work
that the native path pays at mount. Pivot was not included in the 12-row timing
control: its internal scrollers would need their own viewport hint or estimate;
no Pivot-specific tuning gain is claimed.

### What the profiles establish

Extra native work is distributed through row creation, slot/fallback setup,
dynamic input/attribute resolution, effect creation, class application and DOM
insertion. Native hotspots include `getProp`, `resolveFallthroughAttrs`,
`patchDynamicProps`, `isValidBlock` and `setClassIncremental`, together
with the row component/slot bodies. Inclusive stack times overlap and are not
added together as independent costs.

The corresponding current-VDOM/native-parent trace medians for actual Layout
work are close: **3.81/3.88ms Table, 0.57/0.58ms Tree, 1.90/1.96ms Pivot**.
This does not show an extra multi-millisecond native layout cost. The initial
DOM/setup work is the useful target. Pivot's worker publication and subsequent
render are included in readiness; submitting a worker job is never treated as
completed output. Main-thread CPU profiles are complemented by browser traces.

Icon-name resolution is about 2.1–2.2ms of sampled Tree mount work in both
current compilers. It is a measurable part of current initialization, rather
than an explanation for the remaining native-versus-current-VDOM difference.
Profiles are diagnostic and add overhead; the latency tables use uninstrumented
runs. Some Vue source maps point at generated script modules, rather than the
original SFC line numbers.

### Native-parent cleanup defect and repair

The first expanded run failed its retention gate. From cycles 10 to 30 the
native parent retained **6,020 extra DOM nodes / 1,440 listeners for Tree** and
**10,620 nodes / 3,740 listeners for Pivot**. The previous mixed-owner checkpoint
had not exercised this parent path.

Heap paths and an independent small reproduction identified two retention
paths in runtime icons:

1. Nuxt reads a computed async-data key during disposal. In Vue 3.6 that read can
   subscribe the dead key to the surviving native parent's active scope.
2. A cached icon request handler captured its original component's computed
   props/setup context, giving the data cache a path back to removed UI.

`useRuntimeIcon` now owns its async-data effects, collects teardown reads in a
separate temporary cleanup scope, and stops that scope after disposal. Cached
request handlers capture primitive request values and the fetch function;
component-owned watches update the request name. Cached-data lookup is also
independent of setup context. It uses public Vue/Nuxt APIs throughout and keeps
SSR data, aliases, colors, unavailable/stale handling, request cancellation and
offline remount reuse intact.

The new native regression remounts icon owners thirty times in every engine;
Chromium additionally checks GC counters. The full native suite passes **99/99**
and affected production icon/Tree/Pivot-worker tests pass **48/48**, with no
skips or retries. Both final performance matrices pass every current retention
gate, including the current VDOM control.

Separate GC-loop remount observations for the native parent:

| Family | First ten mount median ms | Last ten mount median ms | DOM added, cycle 10 → 30 | Listeners added |
| --- | ---: | ---: | ---: | ---: |
| table | 26.6 | 25.9 | 0 | 0 |
| tree | 28.0 | 26.7 | 0 | 0 |
| pivot | 33.3 | 32.0 | 0 | 0 |
| selector | 5.7 | 5.8 | 0 | 0 |
| scroller | 4.4 | 5.2 | 0 | 0 |

These are thirty-cycle observations, not a long-running soak certification.
Small latency variation remains visible in the raw data, particularly the
scroller; it is not evidence of retained DOM/listener growth. Fresh remounts
still repeat the provisional-row and native setup work described above.

### SSR, hydration and scrolling

Default workload: **90/90 clean current checks** — three current compiler/parent
variants × five families × three engines × JS off/on. The unchanged old baseline
has 21 clean checks and nine recorded limitations: missing Tree SSR rows in all
three engines, plus Tree/Pivot hydration mismatches in all three engines.

Initial-row control: **54/54 clean current checks**; old baseline 12 clean and
six recorded Tree limitations. Both matrices complete all expected outcomes;
these are not described as 192 clean passes. Renderer diagnostics remain strict.

Default scroll p95 frame intervals, ms, thirty real movements per run:

| Family | 2.3 VDOM | Current VDOM control | Vapor / VDOM parent | Vapor / Vapor parent |
| --- | ---: | ---: | ---: | ---: |
| table | 13.8 | 25.7 | 27.3 | 25.6 |
| tree | 19.2 | 27.2 | 27.5 | 27.2 |
| pivot | 21.1 | 27.0 | 12.0 | 26.0 |
| scroller | 27.4 | 17.6 | 25.5 | 26.2 |

All **28 default/control scroll runs** found a real overflow target, moved it,
and changed rendered records. These short local scroll samples are neither INP
nor field smoothness scores. Selector is excluded from the scrolling workload.

### Compressed asset inventory

| All emitted JS/CSS | Files | Raw bytes | Sum of per-file gzip bytes |
| --- | ---: | ---: | ---: |
| 2.3 VDOM | 501 | 2,688,885 | 935,912 |
| Current VDOM control | 507 | 2,764,478 | 966,219 |
| Vapor / VDOM parent | 507 | 2,845,144 | 992,170 |
| Vapor / Vapor parent | 507 | 2,845,079 | 992,098 |

Old baseline → current VDOM adds **30,307 bytes**.
Current VDOM → native-parent build adds another **25,879 bytes net**.
Total versus old baseline: **56,186 bytes / 54.9 KiB / 6.0%**.
Changing only the current parent reduces the inventory by 72 bytes, which is
negligible. The larger inventory therefore has both library-change and native
compiler/runtime contributions. The Nuxt root still retains framework VDOM
paths alongside Vapor. No claim is made that converting the root will recover
the entire increase.

This sums every individually gzipped emitted JS/CSS file, including lazy
chunks, not initial-route transfer bytes. Hidden maps are excluded. Per-module
rendered lengths and exact per-file gzip sizes are in the raw report;
compression and chunk boundaries prevent exact additive per-module attribution.
The readable native audit build has a different purpose and is not comparable
to these minified inventories.

The fresh standalone audit still compiles **242/242 UI SFCs as Vapor**, with no
UI VDOM render imports or icon renderer modules. Its final 443 JavaScript files
include the worker and total **7,266,413 unminified bytes**.
Framework `createVNode` remains; H05 and the Nuxt application root stay open.
See the [native audit](native-vapor-audit.md).

A separate Chrome 155 cache-bypassed local reload of the native-parent Table
page observes **LCP 171ms, TTFB 20ms, render delay 151ms, CLS 0.00**. LCP is the
H1 heading and does not measure full Table readiness. The 382 inspected document,
script, style and XHR/fetch requests comprise 381 HTTP 200 and one i18n 304
revalidation; there are no console warnings/errors. Column option controls
have accessible names. This single observation uses a different browser from
the warm timing run and has no field/INP claim. The local document-compression
insight estimates zero FCP/LCP savings; no deployment change is inferred.

### Reproduce

Run from the workspace root, preserving the working-copy changes:

```sh
VAPOR_PERFORMANCE_UI_REF=ad740a61190e7b1961386982da03f8a1d2a5e4e8 VAPOR_PERFORMANCE_UTILITIES_REF=35b19e8db4bd95e9eafbed4a0744944b96301788 node tooling/performance/prepare-baseline.mjs
node tooling/performance/prepare-current-vdom.mjs
for renderer in vdom current-vdom vapor vapor-parent; do
  VAPOR_PERFORMANCE_RENDERER="$renderer" bunx --no-install nuxt build tooling/performance
done
```

Run each server in its own terminal:

```sh
PORT=3023 HOST=127.0.0.1 node tooling/performance/.output/vdom/server/index.mjs
PORT=3024 HOST=127.0.0.1 node tooling/performance/.output/vapor/server/index.mjs
PORT=3025 HOST=127.0.0.1 node tooling/performance/.output/vapor-parent/server/index.mjs
PORT=3026 HOST=127.0.0.1 node tooling/performance/.output/current-vdom/server/index.mjs
```

With other validation jobs idle, run timing before profiling or DOM interception:

```sh
VAPOR_PERFORMANCE_REPORT=.cache/vapor-performance.json node tooling/performance/run.mjs
VAPOR_PERFORMANCE_FAMILIES=table,tree,scroller VAPOR_PERFORMANCE_INITIAL_ROWS=12 VAPOR_PERFORMANCE_REPORT=.cache/vapor-performance-initial-12.json node tooling/performance/run.mjs
node tooling/performance/profile.mjs
VAPOR_ROW_REPORT=.cache/vapor-rows.json node tooling/performance/observe-rows.mjs
bunx --no-install nuxt typecheck tooling/performance
```

Stop owned servers afterwards. Both disposable library copies, generated
benchmark outputs and diagnostic heaps are removed after verification. Raw
reports, decoded CPU summaries, final profiles/traces and frozen benchmark
assets remain in `.cache/vapor-parent-comparison-2026-10-22`; portable evidence
is linked above. The earlier broader browser/visual verification remains a
historical checkpoint in [testing notes](../testing.md).
