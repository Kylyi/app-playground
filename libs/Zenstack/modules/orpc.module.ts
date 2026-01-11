import { addTemplate, createResolver, defineNuxtModule } from 'nuxt/kit'
import { readdir } from 'node:fs/promises'
import { camelCase } from 'change-case'
import { existsSync } from 'node:fs'

const { resolve } = createResolver(import.meta.url)

const orpcRouterTemplate = `<ROUTER_IMPORTS>

export const router = {
  <ROUTERS>
}

export type IRouter = typeof router
export type IRouterClient = RouterClient<IRouter>
`

export default defineNuxtModule({
  setup: async (_, nuxt) => {
    console.log('✔ Creating routers virtual file...')

    let zenstackLayerPath = ''
    const pattern = /^.*\.router\.ts$/
    const routers: Array<{
      ROUTER_IMPORT: string
      ROUTER: string
    }> = []

    for await (const layer of nuxt.options._layers) {
      const path = resolve(layer.cwd, 'server')
      const pathExists = existsSync(path)

      if (!pathExists) {
        continue
      }

      const layerServerFiles = await readdir(path)

      if (layer.meta?.name === 'zenstack') {
        zenstackLayerPath = path
      }

      routers.push(...layerServerFiles
        .filter(file => pattern.test(file))
        .map(file => {
          const name = camelCase(file.split('.')?.[0] ?? '')
          const filePath = file.split('.').slice(0, -1).join('.')

          return {
            ROUTER_IMPORT: `import { router as ${name}Router } from '${path}/${filePath}'`,
            ROUTER: `${name}: ${name}Router`,
          }
        }))
    }

    const routersFileContents = orpcRouterTemplate
      // .replace('<PUBLIC_PROCEDURE_IMPORT_PATH>', `${zenstackLayerPath}/procedures/public.procedure`)
      // .replace('<PROTECTED_PROCEDURE_IMPORT_PATH>', `${zenstackLayerPath}/procedures/protected.procedure`)
      .replace('<ROUTER_IMPORTS>', routers.map(r => r.ROUTER_IMPORT).join('\n'))
      .replace('<ROUTERS>', `${routers.map(r => r.ROUTER).join(',\n  ')},`)

    addTemplate({
      filename: `${nuxt.options.rootDir}/generated/orpc-routers.ts`,
      write: true,
      getContents: () => routersFileContents,
    })

    nuxt.hook('vite:extendConfig', config => {
      if (config.resolve) {
        if (!config.resolve.alias) {
          config.resolve.alias = {}
        }

        config.resolve.alias = {
          ...config.resolve.alias,
          $router: `${nuxt.options.rootDir}/generated/orpc-routers.ts`,
        }
      }
    })
  },
})
