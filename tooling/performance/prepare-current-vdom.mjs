import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parse } from '@vue/compiler-sfc'
import { adaptVDOMDirectives } from './vdom-directives.mjs'

const workspace = resolve(import.meta.dirname, '../..')
const sourceRoot = resolve(process.env.VAPOR_PERFORMANCE_SOURCE ?? resolve(workspace, 'packages'))
const destination = resolve(process.env.VAPOR_PERFORMANCE_VDOM_DIRECTORY ?? resolve(workspace, '.cache/vapor-performance-current-vdom'))
const nuxtCLI = fileURLToPath(new URL('bin/nuxt.mjs', import.meta.resolve('nuxt/package.json')))
const ignored = new Set(['.git', '.nuxt', '.output', '.cache', 'node_modules'])
const manifest = {
  method: 'Current source; SFC vapor markers removed and renderer-specific directive lifecycles adapted',
  sources: {},
  preparedSources: {},
  compilerAdjustments: [],
  rendererAdapters: [],
}
mkdirSync(destination, { recursive: true })
if (!existsSync(resolve(destination, 'node_modules'))) {
  symlinkSync(resolve(workspace, 'node_modules'), resolve(destination, 'node_modules'), 'dir')
}
for (const layer of ['UI', 'Utilities']) {
  const source = resolve(sourceRoot, layer)
  const path = resolve(destination, layer)
  rmSync(path, { recursive: true, force: true })
  cpSync(source, path, {
    recursive: true,
    filter: file => !ignored.has(basename(file)) && !basename(file).startsWith('.env'),
  })
  const files = execFileSync('rg', ['--files', '--no-ignore', path], { encoding: 'utf8' }).trim().split('\n').sort()
  for (const file of files) {
    const original = readFileSync(file)
    const relative = file.slice(destination.length + 1)
    manifest.sources[relative] = createHash('sha256').update(original).digest('hex')
    manifest.preparedSources[relative] = manifest.sources[relative]
    if (!file.endsWith('.vue')) {
      continue
    }
    const code = original.toString('utf8')
    const { descriptor } = parse(code, { filename: file })
    const blocks = [descriptor.scriptSetup, descriptor.template]
      .filter(block => block?.attrs.vapor)
      .sort((left, right) => right.loc.start.offset - left.loc.start.offset)
    let vdom = code
    if (blocks.length) {
      for (const block of blocks) {
        const start = vdom.lastIndexOf(`<${block.type}`, block.loc.start.offset)
        const tag = vdom.slice(start, block.loc.start.offset)
        vdom = vdom.slice(0, start) + tag.replace(/\s+vapor(?=[\s>])/, '') + vdom.slice(block.loc.start.offset)
      }
    }
    // compiler-sfc omits empty setup blocks from the descriptor, but their
    // vapor attribute still selects the native compiler (eight UI leaves).
    vdom = vdom.replace(/<script\b(?:[^>"']|"[^"]*"|'[^']*')*>\s*<\/script>/g, tag => {
      return tag.replace(/\s+vapor(?=[\s>])/, '')
    })
    if (vdom !== code) {
      manifest.compilerAdjustments.push(relative)
    }
    const adapted = adaptVDOMDirectives(vdom, relative)
    vdom = adapted.code
    if (adapted.adapters.length) {
      manifest.rendererAdapters.push({ file: relative, changes: adapted.adapters })
    }
    if (vdom !== code) {
      writeFileSync(file, vdom)
      manifest.preparedSources[relative] = createHash('sha256').update(vdom).digest('hex')
    }
    assert.equal(parse(vdom, { filename: file }).descriptor.vapor, false, `${relative} must compile as VDOM`)
  }
}
for (const layer of ['Utilities', 'UI']) {
  execFileSync(process.execPath, [nuxtCLI, 'prepare', resolve(destination, layer)], {
    cwd: workspace,
    stdio: 'inherit',
    env: { ...process.env, GENTL_PREPARING_NUXT_LAYERS: 'true', NUXT_DOTENV_DIR: workspace },
  })
}
manifest.sha256 = createHash('sha256').update(JSON.stringify(manifest.sources)).digest('hex')
manifest.preparedSha256 = createHash('sha256').update(JSON.stringify(manifest.preparedSources)).digest('hex')
writeFileSync(resolve(destination, 'source.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Prepared ${manifest.compilerAdjustments.length} current SFCs for the diagnostic VDOM control`)
