# TypeScript 7 and Vue type checking

Researched 2026-09-04 for Nuxt 4.5.2 and vue-tsc 3.3.11.

## Selected solution: the Vue maintainer's native bridge

Use Johnson Chu's (`johnsoncodehk`) `typescript-native-bridge`, pinned to `6.0.3-bridge.16.tsgo.7.0.2`, as the `typescript` dependency. It preserves the classic compiler API expected by Vue tooling while running the native TypeScript 7.0.2 checker. The `6.0.3` prefix identifies its compatibility surface; this does not downgrade type checking to the TypeScript 6 engine. [Bridge documentation](https://github.com/johnsoncodehk/typescript-native-bridge), [pinned release](https://github.com/johnsoncodehk/typescript-native-bridge/releases/tag/v6.0.3-bridge.16.tsgo.7.0.2)

```json
{
  "devDependencies": {
    "typescript": "npm:typescript-native-bridge@6.0.3-bridge.16.tsgo.7.0.2",
    "vue-tsc": "3.3.11"
  },
  "scripts": {
    "typecheck": "nuxt typecheck"
  }
}
```

Keep the usual Nuxt/vue-tsc workflow. Vue Language Tools itself adopted this bridge for its builds and tests in July 2026. Verify that the checker prints `TNB ACTIVE`, which identifies the native bridge in use. [Vue Language Tools migration](https://github.com/vuejs/language-tools/pull/6129), [bridge verification instructions](https://github.com/johnsoncodehk/typescript-native-bridge#confirm-its-working)

## Why stock TypeScript 7 fails

Stock TypeScript 7 does not supply the previous JavaScript compiler API. vue-tsc 3.3.11 still resolves `typescript/lib/tsc` and wraps it through Volar. The bridge supplies that interface; a direct `typescript: 7.0.2` dependency does not. [Microsoft release announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), [vue-tsc 3.3.11 source](https://github.com/vuejs/language-tools/blob/v3.3.11/packages/tsc/index.ts)

## Alternatives evaluated

Nuxt also officially supports `nuxt typecheck --checker=golar`. The bridge was selected to retain the existing Vue checker. Both native approaches initially exposed the dependency-resolution problem below; those errors were not evidence of a Golar-specific Vue bug. [Nuxt checker documentation](https://nuxt.com/docs/4.x/api/commands/typecheck)

## Required dependency-resolution fix

Declare `defu: 6.1.7` as a direct dependency: application utilities already import it. Without this, Nuxt generated a `defu` path alias pointing into `node_modules`. The native checker resolved the CommonJS declarations instead of the package's ESM exports, reported `createDefu` missing, and lost the shared UI configuration's types. That caused hundreds of downstream missing-prop errors.

Nuxt skips this generated import alias for declared dependencies. Adding `defu` and regenerating types restores normal export resolution without editing generated files or weakening type checks. TypeScript documents that `paths` pointing into packages bypass package exports. [Nuxt 4.5.2 imports implementation](https://github.com/nuxt/nuxt/blob/v4.5.2/packages/nuxt/src/imports/module.ts), [TypeScript module-resolution reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html#paths-should-not-point-to-monorepo-packages-or-node_modules-packages)

## Separate upgrade issue

Vitest 5 removed the top-level `bench` import. Benchmarks now use the `bench` fixture inside `test()`; affected benchmark files need migration independently of the Vue compiler fix. [Vitest benchmark API change](https://vitest.dev/api/test.html#bench)

## Local verification

- `bun run typecheck` exits 0 and prints `TNB ACTIVE`.
- A temporary Vue SFC with an invalid TypeScript assignment and an invalid template property produced both expected diagnostics and a nonzero exit. After removing it, the normal typecheck passed again.
- All four migrated pivot benchmarks pass with `bunx --no-install vitest bench packages/UI/app/components/Pivot/functions/pivot-transform-data.bench.ts --run --environment node`.
- The default Nuxt test environment still fails to start under Vitest 5 because it imports the removed `vitest/environments` export. This is separate from typecheck; the benchmark's Node run exits 0, with a Nuxt client-manifest warning during cleanup.
