---
name: code-standards
description: Apply repository coding conventions when writing or materially editing TypeScript, Vue, or supporting code.
---

# Code standards

Follow the repository ESLint configuration and nearby code. When conventions are unclear, inspect 3–5 neighboring files. User instructions take precedence.

This is a standalone Nuxt app. Run Bun and root package scripts here. UI and Utilities live in `packages/UI` and `packages/Utilities` as Git submodules. Keep application → UI → Utilities dependencies; layers declare their dependencies and remain consumable with Nuxt `extends`. Product policy stays in the application. For other consumers, resolve installed/configured layer locations.

For Vapor components, renderer helpers, or migration tests, read [vapor.md](vapor.md). Preserve the navigation completion requirement in the root AGENTS.md.

## Affected validation

Run affected lint, typechecks, and meaningful regression checks as part of the authorized change without repeated approval. Choose the smallest supported scope. Broaden checks for shared contracts, dependency/configuration changes, or evidence of wider impact. Fix new failures; report existing failures or missing dependencies, generated artifacts, credentials, and services as concrete blockers. Do not claim a check passed merely because its command exists. Add tests only for behavior that could regress; skip tests that restate implementation or mocks.

Use `bunx --no-install eslint <affected-files>` and `bun run typecheck` for affected TypeScript/Vue changes. Run focused `bun run test:run <test-file>` checks, `bun run test:tooling` for lint-tooling changes, and affected `bun run test:e2e <test-file>` scenarios for browser behavior; inspect Vitest/Playwright configuration for required setup.

## Shared conventions

- Prefer `type`, separate `import type`, inference when clear, and `unknown` over `any`.
- Use at most 3 function parameters (prefer 2); beyond that use an `options` object.
- Use lodash-es `isNil` / `!isNil` for null-or-undefined checks instead of loose equality.
- Prefer wrapping near 80 columns; Vue's configured limit is 120.
- Require curly braces. Use 1tbs; the documented blank-line-before-`else` exception is accepted for long branches. See the examples reference; do not generalize the exception to unrelated lint rules.
- Reuse lodash-es, VueUse, and internal Utilities when suitable; prefer idiomatic ECMAScript built-ins over equivalent library helpers.
- Extract real reuse (more than two uses) or meaningful domain concepts. Keep one-off logic near its caller; avoid tiny wrappers that add only indirection.
- Comments explain intent, tradeoffs, or non-obvious context. Section separators help around 200+ lines; skip heavy segmentation in small files.
- Conventional Commits for PR/master messages. Human merge workflow prefers squash and rebase; this does not authorize Git mutations.

## Task-specific guidance

For Vue, Nuxt, UI components, i18n, or styling, read [frontend.md](frontend.md). It covers supported `ui` overrides, autoimports, SSR, SFC order, and the maximum of 3 attributify attributes.
For substantial examples and the accepted brace exception, consult [reference.md](reference.md) only as needed.
