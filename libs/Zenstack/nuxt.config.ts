import { join } from 'pathe'
import { defineNuxtConfig } from 'nuxt/config'

// Scripts
import { generateOpenAPI } from './scripts/generate-open-api'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  $meta: {
    name: 'zenstack',
  },

  nitro: {
    imports: {
      imports: [
        { name: 'publicProcedure', from: resolve('./server/procedures/public.procedure.ts') },
        { name: 'protectedProcedure', from: resolve('./server/procedures/protected.procedure.ts') },
      ],
    },
  },

  typescript: {
    includeWorkspace: true,
    tsConfig: {
      compilerOptions: {
        paths: {
          $router: [join(process.cwd(), 'generated', 'orpc-routers.ts')],
        },
      },
    },
  },

  hooks: {
    ready: async () => {
      console.log('✔ Generating OpenAPI...')
      // await generateOpenAPI()
    },
  },
})
