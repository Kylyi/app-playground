import { existsSync, readdirSync } from 'node:fs'
import { cwd } from 'node:process'
import { join } from 'pathe'

type ConnectedLib = {
  name: string
  rootDir: string
  appDir: string
  serverDir: string
  sharedDir: string
}

type ComponentDir = {
  path: string
  pathPrefix: false
}

export type ConnectedLibsConfig = {
  componentDirs: ComponentDir[]
  importDirs: string[]
  serverDirs: string[]
  appTypeIncludes: string[]
  serverTypeIncludes: string[]
  sharedTypeIncludes: string[]
}

const libsRootDir = join(cwd(), 'libs')

function discoverLibs() {
  if (existsSync(libsRootDir) === false) {
    return []
  }

  return readdirSync(libsRootDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort()
}

function resolveLibs(libs: string[]): ConnectedLib[] {
  return libs.map(name => {
    const rootDir = join(libsRootDir, name)

    return {
      name,
      rootDir,
      appDir: join(rootDir, 'app'),
      serverDir: join(rootDir, 'server'),
      sharedDir: join(rootDir, 'shared'),
    }
  })
}

export function connectLibs(libs: string[] = discoverLibs()): ConnectedLibsConfig {
  const connectedLibs = resolveLibs(libs)

  return {
    componentDirs: connectedLibs.map(lib => ({
      path: join(lib.appDir, 'components'),
      pathPrefix: false,
    })),
    importDirs: connectedLibs.flatMap(lib => [
      join(lib.appDir, 'composables'),
      join(lib.appDir, 'utils'),
      join(lib.sharedDir, 'types'),
      join(lib.sharedDir, 'utils'),
    ]),
    serverDirs: connectedLibs.map(lib => lib.serverDir).filter(existsSync),
    appTypeIncludes: connectedLibs.map(lib => `../libs/${lib.name}/app/**/*`),
    serverTypeIncludes: connectedLibs.flatMap(lib => [
      `../libs/${lib.name}/server/**/*`,
      `../libs/${lib.name}/shared/**/*.d.ts`,
    ]),
    sharedTypeIncludes: connectedLibs.map(lib => `../libs/${lib.name}/shared/**/*`),
  }
}
