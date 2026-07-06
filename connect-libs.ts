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

type ConnectedLibI18nLocale = {
  code: string
  dateFormat?: string
  currency?: string
  files: string[]
  icon?: string
}

type ConnectedLibI18nConfig = {
  langDir: string
  locales: ConnectedLibI18nLocale[]
}

export type ConnectedLibsConfig = {
  componentDirs: ComponentDir[]
  importDirs: string[]
  serverDirs: string[]
  appTypeIncludes: string[]
  serverTypeIncludes: string[]
  sharedTypeIncludes: string[]
  i18n: ConnectedLibI18nConfig
}

const libsRootDir = join(cwd(), 'libs')

const localeDefaultsByCode: Record<string, Omit<ConnectedLibI18nLocale, 'code' | 'files'>> = {
  'cs-CZ': {
    dateFormat: 'DD.MM.YYYY',
    currency: 'CZK',
    icon: 'i-emojione:flag-for-czechia',
  },
  'en-US': {
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    icon: 'i-emojione:flag-for-united-kingdom',
  },
}

function discoverLibs() {
  if (existsSync(libsRootDir) === false) {
    return []
  }

  return readdirSync(libsRootDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort()
}

function getLocaleCode(fileName: string) {
  return fileName.match(/^(.+?)_/)?.[1]
}

function discoverLibI18nFiles(lib: ConnectedLib) {
  const i18nDir = join(lib.rootDir, 'i18n')

  if (existsSync(i18nDir) === false) {
    return []
  }

  return readdirSync(i18nDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
    .map(entry => ({
      code: getLocaleCode(entry.name),
      path: `${lib.name}/i18n/${entry.name}`,
    }))
    .filter((entry): entry is { code: string, path: string } => Boolean(entry.code))
    .sort((a, b) => a.path.localeCompare(b.path))
}

function getConnectedLibsI18n(connectedLibs: ConnectedLib[]): ConnectedLibI18nConfig {
  const filesByLocaleCode = new Map<string, string[]>()

  for (const lib of connectedLibs) {
    for (const file of discoverLibI18nFiles(lib)) {
      filesByLocaleCode.set(file.code, [
        ...(filesByLocaleCode.get(file.code) ?? []),
        file.path,
      ])
    }
  }

  return {
    langDir: '../libs',
    locales: [...filesByLocaleCode.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([code, files]) => ({
        code,
        ...localeDefaultsByCode[code],
        files: files.sort(),
      })),
  }
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
      `../libs/${lib.name}/server/api/*`,
    ]),
    sharedTypeIncludes: connectedLibs.map(lib => `../libs/${lib.name}/shared/**/*`),
    i18n: getConnectedLibsI18n(connectedLibs),
  }
}
