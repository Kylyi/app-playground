import type { AnyRouter } from '@orpc/server'
import { createJiti } from 'jiti'
import { OpenAPIGenerator } from '@orpc/openapi'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { join } from 'pathe'
import { writeFile } from 'node:fs/promises'

// Create jiti instance that resolves Nuxt aliases from .nuxt/tsconfig.json
const jiti = createJiti(import.meta.url, {
  alias: await loadNuxtAliases(),
})

async function loadNuxtAliases(): Promise<Record<string, string>> {
  const fs = await import('node:fs/promises')
  const nuxtTsConfigPath = join(process.cwd(), '.nuxt', 'tsconfig.json')

  try {
    const tsconfig = JSON.parse(await fs.readFile(nuxtTsConfigPath, 'utf-8'))
    const paths = tsconfig.compilerOptions?.paths ?? {}
    const aliases: Record<string, string> = {}

    // Convert tsconfig paths to jiti aliases
    // Paths are relative to .nuxt folder, so we need to resolve them from project root
    const nuxtDir = join(process.cwd(), '.nuxt')

    for (const [alias, targets] of Object.entries(paths)) {
      if (Array.isArray(targets) && targets.length > 0) {
        // Remove trailing /* from alias and path for jiti compatibility
        const cleanAlias = alias.replace(/\/\*$/, '')
        const cleanTarget = (targets[0] as string).replace(/\/\*$/, '')
        aliases[cleanAlias] = join(nuxtDir, cleanTarget)
      }
    }

    return aliases
  }
  catch (error) {
    console.warn('Could not load .nuxt/tsconfig.json, run "nuxt prepare" first:', error)
    return {}
  }
}

const generator = new OpenAPIGenerator({
  schemaConverters: [
    new ZodToJsonSchemaConverter(),
  ],
})

export async function generateOpenAPI() {
  // Import router using jiti to resolve Nuxt aliases
  const { router } = await jiti.import('~~/generated/orpc-routers') as { router: AnyRouter }

  const spec = await generator.generate(router, {
    info: {
      title: 'ORPC Playground',
      version: '1.0.0',
    },
    servers: [
      { url: '/api' },
    ],
  })

  await writeFile(join(process.cwd(), 'public', 'open-api.json'), JSON.stringify(spec, null, 2))
}
