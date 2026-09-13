# Install deps

```
bun install
```

# Get submodule

```bash
git submodule update --init --recursive --remote
```

# TypeScript 7

Run type checking with:

```bash
bun run typecheck
```

This project uses the native TypeScript 7.0.2 checker through
[Johnson Chu's `typescript-native-bridge`](https://github.com/johnsoncodehk/typescript-native-bridge).
The bridge preserves the compiler API required by `vue-tsc`, so the existing
`nuxt typecheck` workflow also checks Vue scripts and templates.

In `package.json`, `typescript` is aliased to
`npm:typescript-native-bridge@6.0.3-bridge.16.tsgo.7.0.2`. The `6.0.3` prefix refers
to API compatibility; the checker runs the TypeScript 7 engine. Keep this alias
pinned when updating dependencies: replacing it with stock `typescript@7`
breaks the current Vue checker. A `TNB ACTIVE` message confirms the bridge is running.

Keep `defu` as a direct dependency as well. This prevents Nuxt from generating a
path alias that resolves the wrong declarations and causes cascading UI prop errors.

See [the research notes](docs/research/typescript-7-vue.md) for sources and verification details.

## Cursor / VS Code setup

Open the repository root as your workspace. The workspace settings in
`.vscode/settings.json` point the editor at the same bridge used by the CLI:

```json
{
  "js/ts.tsdk.path": "node_modules/typescript/lib",
  "js/ts.tsdk.promptToUseWorkspaceVersion": true
}
```

With a TypeScript or Vue file open, run **TypeScript: Select TypeScript Version**
from the Command Palette and choose **Use Workspace Version**. The version should
show `6.0.3-bridge.16.tsgo.7.0.2`. Keep **Vue - Official** enabled. If diagnostics
remain stale after changing the SDK or regenerating types, run
**Developer: Reload Window**.

### IDE errors when CLI typecheck passes

The root typecheck and the editor can use different Nuxt projects. For files in
`packages/UI`, the editor can select `packages/UI/.nuxt/tsconfig.app.json` through
the layer's own `tsconfig.json`.

The UI layer must extend the local `../Utilities` layer when available and declare
`defu` as a direct dependency in its own `package.json`. Without these, its generated
types can miss Utilities auto-imports such as `isNil` and `useNumber`, and UI props
such as `placeholder` and `disabled` can appear to be missing.

After changing layer configuration or dependencies, regenerate the layer's types
from the repository root:

```bash
NUXT_DOTENV_DIR="$PWD" bunx --no-install nuxt prepare packages/UI
bun run typecheck
```

The automatic layer preparation currently skips layers that already have a
`.nuxt` directory, so a root install or typecheck alone may leave existing layer
types stale. Regenerate them explicitly rather than editing generated `.nuxt` files.

## Code standards and testing

Follow the [code standards](.agents/skills/code-standards/SKILL.md), adapted from
`mono_new` for a standalone Nuxt application and reusable UI/Utilities layers.
See [testing](docs/testing.md) for Playwright SSR/hydration, axe accessibility,
Vitest and Vapor ESLint checks.

## Vapor migration

See the [migration checklist](docs/vapor-migration.md) and
[component inventory](docs/vapor-components.md) for progress and remaining work.
