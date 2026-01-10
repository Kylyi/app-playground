import { join } from 'pathe'
import { defineNuxtConfig } from 'nuxt/config'

// Scripts
import { generateOpenAPI } from './scripts/generate-open-api'

export default defineNuxtConfig({
  $meta: {
    name: 'zenstack',
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
