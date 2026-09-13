# Project conventions

When writing or materially editing code, read and follow
[code standards](.agents/skills/code-standards/SKILL.md).
For Vapor components, shared renderer helpers, or migration tests, also read
[Vapor migration conventions](.agents/skills/code-standards/vapor.md).

This is a standalone Nuxt application. UI and Utilities are reusable Git
submodules; preserve existing changes in each checkout and keep imports directed
from the application to UI to Utilities. Tooling runs from this root.

When completing a new playground example, add it to the appropriate navigation
group in `app/layouts/default.vue`, including meaningful query variants. Verify
its localized link before reporting the example ready; do this automatically.
