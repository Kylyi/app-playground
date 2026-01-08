import { join } from 'pathe'

// Scripts
import { generateOpenAPI } from './scripts/generate-open-api'
import { runWithNuxtContext } from 'nuxt/kit'

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
      await generateOpenAPI()
    },
  },
})
