# Vapor migration

Use explicit model refs, emit callbacks and DOM element refs in shared helpers.
Expose focus/root/scroll APIs deliberately. Render slots declaratively instead
of inspecting VNodes. Keep SSR output deterministic; browser diagnostics should
start with the same server/client value and update after mount.

The local ESLint rule checks SFCs marked `vapor` and helpers containing a
`@vapor-ready` comment. Mark a helper only once its contract works in both
renderers. Legacy files remain eligible for incremental migration; passing this
rule is not proof of runtime compatibility. Review indirect dependency behavior,
especially component refs passed to `unrefElement` and VueUse functions needing
an implicit instance. Use a narrowly explained rule suppression for intentional
diagnostic probes, not production helpers.

Tests should exercise DOM behavior across VDOM/Vapor boundaries, including
server HTML without JavaScript and subsequent hydration. Use Playwright for
focus, layout, overlays, keyboard and drag interactions. Use Vitest for logic
and fast-check when generated values/sequences can expose a real state defect.
Keep Playwright and Node tooling tests out of Vitest's Nuxt environment.

Native controls and literal diagnostic text are intentional in renderer test
fixtures: using a UI control everywhere would hide which renderer implements
the behavior under test. Product screens continue following the UI/i18n rules.
Node scripts and browser test modules use explicit imports; Nuxt autoimports
apply only in code transformed by Nuxt.

Axe checks complement explicit keyboard/focus tests; they do not certify full
accessibility. Compare visual baselines only in a pinned browser/OS/font
environment. Do not automatically accept changed snapshots as a fix.
