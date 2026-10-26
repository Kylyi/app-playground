# Tree hydration — HY01

The 2026-10-12 fix uses Nuxt 4.6.1 and matched Vue 3.6.0-rc.11. Tree now
commits built-in sorting/search and synchronous custom search before rendering,
without asynchronous setup. HY01 is an ordinary strict regression test;
its expected-failure annotation is removed.

## Initial data

The previous asynchronous flatten/search made SSR render 1,000 nodes while the
first client pass saw none. Synchronous variants of the Utilities sorting and
searching helpers remove that gap; their existing public async APIs still return
Promises. Tree rebuilds hierarchy indexes before one initial search, and ignores
queued duplicate initialization caused by merged configuration.

Custom Promise searches render a deterministic pending first pass on both the
server and client. Even a server-resolved Promise does not create rows that the
initial client pass cannot reproduce. Results commit after mount; generation and
scope checks discard stale results and results from an unmounted owner. This is
the explicit asynchronous-search contract, while static and synchronous filtered
data remain present in server HTML.

The remaining nested empty-outlet boundary is avoided by providing the scroller's
`inner` slot only when there is no data or actual `content-inner` content. No DOM
wrapper or top-level await is introduced. The no-data slot also stays empty-state
only. Loading and following Tree slots retain their normal ownership.

## Independent native slot defect — resolved

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

Vue RC.10 fixed the empty forwarded-slot SSR range in
[commit 24b4e99](https://github.com/vuejs/core/commit/24b4e99be925a76b8bcd3e32978e9e02547ef855).
RC.11 includes that fix. Both variants now hydrate without warnings in Chromium,
Firefox and WebKit; the empty-slot expected-failure annotation is removed.

## Regression and retest

`tests/e2e/vapor-tree-hydration-probe.spec.mjs` checks both variants after
hydration, the following button, and JavaScript-disabled SSR/navigation. Both
variants are ordinary passing tests, including their no-warning assertions. A
missing child, broken sibling, browser exception or unrelated warning fails
normally.

`HY01: Tree hydrates without mismatch` is now an ordinary test. It checks actual
rows, its following interactive sibling, browser errors and hydration diagnostics.
The initialization suite adds sorted/filtered/custom/empty SSR, matching localized
links, async out-of-order results and disposal/remount. The standalone native
consumer checks the same store without Suspense or `vaporInteropPlugin`.

Historical development validation on 2026-09-29 (RC.9):

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
  tests/e2e/vapor-tree-dms-drop.spec.mjs \
  tests/e2e/vapor-tree-initialization.spec.mjs
```

Keep both the minimal upstream reproduction and the original Tree assertion
when upgrading Vue. The final round runs these checks in development as well as
production in all three engines. Virtualization, both drag modes, selection,
collapse/expand and sibling behavior remain strict regressions. See the current
validation record in [testing](../testing.md) and the
[native audit](native-vapor-audit.md).
