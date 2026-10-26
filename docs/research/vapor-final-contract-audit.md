# Final UI contracts and consumer audit — 2026-10-22

This follow-up closes the library contract review and records the local consumer
rollout requirements. Nuxt's application root remains a separate, deferred task.
The accepted runtime icon implementation is retained; this audit does not expand
its module-option contract.

## Coverage of the remaining audit gates

| Checklist gates | Source review and runtime evidence |
| --- | --- |
| B07: model ownership | The state-ownership classification and current `initRef` callers distinguish configuration from writable models. Inputs/Form/List/Selector/Tree/Pivot/QueryBuilder retain controlled, one-way/local, reset and external prop-update regressions. Concurrent consumer requests and browser contexts verify isolation. |
| C07: refs and DOM inputs | Exposed HTMLElement/control/scroller APIs cover conditional owners, multiple roots and Teleport. Anchor, autofit, virtual-scroller, custom-row and focus tests use those public contracts; no production renderer-private inspection is introduced. |
| D05/D06: slots and components | The previous wrapper inventory and final dynamic-descriptor review cover scoped/fallback slots, changing presence, async registered components and callable/generic SFC types. The new Pivot worker case catches and repairs its initially empty fallback. |
| E05/E06: event/focus order | Checkbox/Radio/Toggle, clear/remove controls, DatePicker, QueryBuilder and Tree/DnD run actual child/ancestor interactions. Mouse/touch, keyboard return/Escape, cancelled gestures and pen PointerEvent flows cover the remaining ordering review. Synthetic pen events test the browser contract; physical stylus hardware is not claimed. |
| F01/F03/F04: integrations | Actual VueUse lifecycle/refs, Floating UI overlays, TanStack virtual rows, PerfectScrollbar and used sortable/Dragdoll paths run under native owners. Resize, scroll, movement, Tree/List drops, remount and disposal remain browser assertions. No compatibility claim is made for unused third-party options. |
| F05/H03: layer consumption | The standalone consumer extends UI and Utilities directly. It compiles all 242 SFCs, uses real Nuxt services and native registration, and typechecks production layers. Localized examples explain imported/registered/resolver components, scoped rows, exposed focus, models and legacy compatibility. |
| G01–G08/H01: family review | The complete 63-family inventory and earlier source/API review are combined with the current production SSR/hydration follow-up and 96-case native suite. Family coverage means significant supported scenarios, not every combination or an individual native mount of every imported SFC. |
| H02: regression guardrails | Existing tooling checks renamed instance imports, private members, implicit models and unsupported lifecycle syntax. The source scan keeps private instance handling in the optional legacy helper; affected lint and the tooling suite verify the guardrail. |
| H06: cleanup | Removed obsolete async initialization/renderer wrappers and repaired owned frames, queries, validation callbacks and concurrent asset writes. The native audit records required DOM/layout/runtime settings and the compatibility adapter's concrete removal condition. |

G10's measurements and remaining tradeoffs are recorded separately in
[vapor-performance.md](vapor-performance.md). B08/H04 retain the external rollout
condition; H05 retains the user-deferred Nuxt application/framework boundary.

## Contract review and repairs

The previous review covered the 242 UI SFCs, 63 families and shared Utilities
contracts. This follow-up checks the remaining model ownership, DOM/ref inputs,
slot forwarding, dynamic components, event propagation, integrations and cleanup
items against the family inventory and production browser tests. It verifies
significant supported scenarios, not every possible prop combination.

| Contract | Finding and final behavior |
| --- | --- |
| Component descriptors | Constructor-only prop extraction rejected callable/generic SFCs. Mapped prop extraction now preserves named prop types even when the generated SFC type contains an index signature. Compile checks accept Tree/TextInput props and reject invalid values. |
| Dynamic registration | UI names now use Vue's native async component wrapper. Imported components, resolver functions and actual template-only callable Vapor components render with models, scoped slots and exposed focus refs. |
| Custom List rows | Vapor row components are accepted by the public type and expose their actual HTMLElement. Custom article rows render during SSR and after owner replacement. |
| List initialization | Supplied rows previously appeared only in the browser. Built-in search/sort/group transforms now run synchronously before rendering. The public async helper still returns a Promise. |
| List asynchronous search | Owned scheduling and request generations discard stale/unmounted results. Promise searches preserve a deterministic pending first pass, expose an error event/slot, and recover after rejection. Selection-focus frame work is scope-owned. |
| Validation queue | Child callbacks previously remained registered after removal. Each owner now removes its own registrations and preserves surviving owners' callbacks. Browser tests verify current focus targets and registry counts across remounts. |
| Form error section | The placeholder prop type hid an obsolete `sectionClass` default. The actual Section contract and supported `containerClass` callback now apply. Type checks reject invalid Section options. |
| Collapse height | The public `autoAdjustHeight` option had an empty implementation. Content resize now animates, respects its cap including zero after close/reopen, handles intrinsic flex height, and cancels pending measurement on disposal. Delayed opening cannot emit after owner removal. |
| Drawer resize | Queued frame work could write a model after removal. Normal release flushes the last position; owner disposal cancels it and removes the document listeners. |
| Responsive queries | Queries created from computed breakpoint getters survived disposal. MenuProxy, compact datetime, PageDrawer, CrudBtns and useMobile now create queries during setup. The remount measurement reproduces the original Table leak and verifies its removal. |
| Reduced motion | Hover text shared a permanent media-query listener. Active owners now share a Boolean query that stops with its final owner. Normal motion animates using a floating position so WebKit's rounded DOM offsets cannot stall it; reduced motion moves immediately in both directions. DOM replacement and owner removal cancel frames/observers, clear styles and reset scroll. Tests retain the removed element and verify replacement/removal rather than relying on disappearance alone. |
| Observer delivery | Overflow handlers and QueryBuilder layout updates could resize an observed ancestor during the observer loop. Owned frames now deliver those updates outside that loop and cancel when refs/owners disappear. An actual self-resizing overflow callback is covered by native and mixed-owner tests. |
| Pivot worker rendering | A worker-computed result had valid rows but no body after remount: its initially empty content fallback was discarded. The content slot is created when a custom slot or fallback content is available. The 2,000-record worker case verifies remount/update under native and mixed owners. |
| Pivot payload ownership | Heap tracing found that Nuxt's cached empty initializer retained each removed Pivot store and its DOM. The undefined source seed no longer registers an initializer, and unmount clears only its owned payload key through the public API. The remount performance gate verifies stable DOM and listener counts. |
| Table column controls | Icon-only column controls lacked accessible names. Localized column option names and expanded state now accompany their real keyboard-open/close behavior, including SSR and the native consumer. |
| Generated icon assets | Concurrent file writes produced malformed JSON during verification. Manifest updates now serialize their read/merge/write, and manifests/SVGs publish by atomic rename. Four real build workers verify all 160 entries and complete SVG files. |

## Consumer audit

`tooling/migration/audit-consumers.mjs` scans local application and non-UI layer
source read-only. It excludes copies of UI/Utilities, generated output and test
fixtures, resolves imported call aliases and object options, and records exact
source locations. File templates are parsed after replacing their generation
tokens; the report retains those template paths.

The refreshed audit read **23,966 source files in 36 local projects**, with zero unresolved
calls or parse failures. The machine-readable findings are in
[vapor-external-consumers.json](vapor-external-consumers.json).
Temporary review worktrees in `mono_new-loop` and generated runs in
`mono_new-codegen-runs` are explicitly excluded from rollout counts; their
copied callsites are not additional consumer applications. Reproduce the scan with:

```sh
node tooling/migration/audit-consumers.mjs /Users/jk/Projects/gentl .cache/vapor-consumer-audit.json mono_new-loop mono_new-codegen-runs
```

| Surface | Local evidence | Rollout decision |
| --- | --- | --- |
| Explicit-instance initRef | 115 calls across 7 projects, including `mono_new`, `app-lc` and DynamicGrid/Monaco integrations | Retain the existing adapter. Move consumers to explicit setup-owned models before removing it. |
| `$hide({ instance })` | 356 calls/review locations, including older applications with their own helper copies | Use an explicit DOM `target` when upgrading to the new helper. Check local copies rather than applying a blind replacement. |
| Direct dialog layout helper | 8 calls with the old argument shape | Supply the owning host getter when adopting the migrated helper. |
| Table persistence | 387 Table declarations; 374 omit an explicit storage key | Preserve the previous stable key where persistence is required. Missing syntax alone is not proof that a table needs persistence; spreads and local wrappers need review. |
| Framework runtime | Several consumers remain on Nuxt 3 or 4.2 | Upgrade the consuming application's compiler/runtime before adopting this native library. |

The compatibility fixture exercises the still-used VDOM instance model, local
and controlled bindings, remounts and reset aliases with an explicit callback.
Its no-JavaScript companion verifies deterministic server HTML. Native consumer
tests exercise the new descriptor/row/ref contracts without interop. Concurrent
server requests and browser contexts verify isolated initial models.

This is a source and public-contract audit of accessible local consumers.
External application checkouts were not upgraded or deployed, and their backend
or authenticated E2E suites are not claimed as tested. Consumer rollout changes
are mapped, not silently treated as complete. Legacy removal remains conditional
on those upgrades; keeping a used adapter is the cleanup decision.

## Verification and remaining boundary

Final command results and performance measurements are recorded in
[testing.md](../testing.md), the
[native bundle audit](native-vapor-audit.md), and the
[performance report](vapor-performance.md). Timing results are mixed; the
comparison does not claim a universal speedup. Browser exceptions, Vue/Vapor warnings and hydration diagnostics remain
test failures. No automatic retry, new skip or expected-failure annotations are introduced.

The new visual matrix passes all 24 cases across Chromium, Firefox and WebKit,
desktop/mobile, and light/dark. All 24 viewport/component pairs (48 images) were
opened and reviewed, along with three native search-error pairs. The focused editor, custom rows and capped Collapse remain
usable, with no new overlap, hidden control or theme defect. Text inside a narrow
focused input retains the browser's ordinary horizontal scrolling.

Nuxt's application root and framework render helpers remain in H05. This review
does not convert application pages/layouts or call the complete application
VDOM-free. The UI's optional legacy compatibility path remains deliberately
separate from its native rendering path.
