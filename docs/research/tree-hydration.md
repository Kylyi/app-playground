# Tree hydration — HY01

Rechecked on 2026-09-29 with matched Vue 3.6.0-rc.9 packages. HY01 remains open:
the initial-data mismatch and a separate native Vapor slot defect both need
resolution. Tree is already a native Vapor component.

## Initial data

Tree calls its asynchronous `init()` during setup and registers that promise
with `onServerPrefetch`. SSR waits for flattening and searching; synchronous
client setup does not. On the 1,000-node playground example, the development
checker reports server `min-height:36000px` against client `min-height:0px`,
extra server rows, and an unexpected client `TreeNoData` element.

A trial awaited initialization during SSR and Nuxt hydration, as Pivot does.
It removed those data/height/empty-state mismatches, and the nine functional
Tree/TreeDms browser checks still passed. One children mismatch remained on the
Tree root around the scroller's following slots. The trial was reverted: it
does not finish HY01, and top-level await also changes Tree into an async-setup
component requiring a Suspense ancestor. The eventual data fix must account for
consumers outside NuxtPage's Suspense boundary rather than silently changing
that contract.

## Independent native slot defect

The permanent reproduction uses only these two native Vapor SFCs:

- `app/pages/vapor-tree-hydration-probe.vue`
- `tests/fixtures/TreeHydrationChild.vue`

There is no Tree, VirtualScroller, VDOM child or asynchronous setup in this
reproduction. A conditional single-root child receives a slot that forwards two
empty outlets, one with a conditional fallback. The parent then renders loading
and inner slot outlets, followed by an interactive sibling.

At `/cs-CZ/vapor-tree-hydration-probe`, rc.9 reports a children mismatch on the
parent while hydrating the child. The captured DOM shows a following slot's
empty comment removed from its SSR markers. The stack reaches
`DynamicFragment.update` → `hydrateDynamicFragmentAnchor` → `executeAnchorPlan`
→ `trimHydrationBoundary` → `cleanupHydrationTail` in `@vue/runtime-vapor`.
The following button still works; the diagnostic is not a general interaction
failure.

The `?mode=provided` control makes the forwarded content non-empty and hydrates
without that mismatch. Both variants are available in localized navigation.
The same empty-content failure was reproduced with an awaited promise in setup
and after removing that await, so Tree's asynchronous initialization is not
required to trigger it.

## Regression and retest

`tests/e2e/vapor-tree-hydration-probe.spec.mjs` checks both variants after
hydration, the following button, and JavaScript-disabled SSR/navigation. Only
the final no-warning assertion for empty content is an expected failure. A
missing child, broken sibling, browser exception or unrelated warning fails
normally. Once Vue fixes the defect, the unexpected pass signals that the
expected-failure annotation should be removed.

The original `HY01: Tree hydrates without mismatch` assertion also remains an
expected failure. A reporter summary counting these cases as passed does not
mean warning-free hydration.

Development validation on 2026-09-29:

- Chromium: all nine existing Tree/TreeDms functional checks passed. The new
  non-empty control and SSR/navigation check passed; Tree HY01 and the empty
  slot reproduction failed as expected (11 ordinary passes, two expected
  failures in the combined run).
- A separate focused run on Chromium, Firefox and WebKit reproduced both
  expected failures in each engine, while both control/SSR checks passed in
  each engine (six ordinary passes and six expected failures overall).
- Affected ESLint and whitespace checks passed. Typecheck retains exactly the
  same 42 diagnostic lines as the I01 baseline; there are no new diagnostics.
  No UI implementation change from the trial is retained. These are development
  hydration results; no new production build is used to infer warning-free
  hydration.

Run from the application root, with the development server on port 3020:

```sh
E2E_BASE_URL=http://127.0.0.1:3020 bun run test:e2e \
  tests/e2e/vapor-tree-hydration-probe.spec.mjs \
  tests/e2e/vapor-tree-drag.spec.mjs \
  tests/e2e/vapor-tree-dms-drop.spec.mjs
```

Retest the minimal reproduction when upgrading Vue. Once it passes, align
Tree's server and initial client data while preserving synchronous consumer
compatibility, then cover sorted/filtered input, asynchronous custom search,
empty trees, TreeDms, remounting and unmounting during initialization. Keep
virtualization, both drag modes, selection, collapse/expand and sibling behavior
in the regression run. Do not close HY01 based only on the non-empty control or
production's reduced hydration diagnostics.
