import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parse } from '@vue/compiler-sfc'

const workspace = resolve(import.meta.dirname, '../..')
const destination = resolve(workspace, '.cache/vapor-performance-baseline')
const refs = {}
const compilerAdjustments = []
mkdirSync(destination, { recursive: true })
if (!existsSync(resolve(destination, 'node_modules'))) {
  symlinkSync(resolve(workspace, 'node_modules'), resolve(destination, 'node_modules'), 'dir')
}
for (const layer of ['UI', 'Utilities']) {
  const repository = resolve(workspace, 'packages', layer)
  const ref = process.env[`VAPOR_PERFORMANCE_${layer.toUpperCase()}_REF`] ?? 'origin/2.3'
  const commit = execFileSync('git', ['rev-parse', ref], { cwd: repository, encoding: 'utf8' }).trim()
  const path = resolve(destination, layer)
  // This directory is an owned snapshot. A newer ref may delete files;
  // extracting over an old archive would silently retain those sources.
  rmSync(path, { recursive: true, force: true })
  mkdirSync(path, { recursive: true })
  const archive = execFileSync('git', ['archive', '--format=tar', commit], { cwd: repository, maxBuffer: 64 * 1024 * 1024 })
  execFileSync('tar', ['-x', '-C', path], { input: archive })
  const components = layer === 'UI'
    ? execFileSync('rg', ['--files', path, '-g', '*.vue'], { encoding: 'utf8' }).trim().split('\n')
    : []
  for (const file of components) {
    const source = readFileSync(file, 'utf8')
    const { descriptor } = parse(source, { filename: file })
    const script = descriptor.scriptSetup
    let vdomSource = source
    if (script?.attrs.vapor) {
      const start = source.lastIndexOf('<script', script.loc.start.offset)
      const tag = source.slice(start, script.loc.start.offset)
      vdomSource = source.slice(0, start) + tag.replace(/\s+vapor(?=[\s>])/, '')
        + source.slice(script.loc.start.offset)
    }
    if (source !== vdomSource) {
      // The 2.3 branch has a partial Vapor pilot. Use its component logic
      // with VDOM compilation so the comparison has a consistent baseline.
      writeFileSync(file, vdomSource)
      compilerAdjustments.push(file.slice(destination.length + 1))
    }
  }
  refs[layer] = commit
}
// These archived layers live outside the normal packages/ directory, so the
// workspace layer hook cannot prepare their referenced TypeScript projects.
const nuxtCLI = fileURLToPath(new URL('bin/nuxt.mjs', import.meta.resolve('nuxt/package.json')))
for (const layer of ['Utilities', 'UI']) {
  execFileSync(process.execPath, [nuxtCLI, 'prepare', resolve(destination, layer)], {
    cwd: workspace,
    stdio: 'inherit',
    env: { ...process.env, GENTL_PREPARING_NUXT_LAYERS: 'true', NUXT_DOTENV_DIR: workspace },
  })
}
writeFileSync(resolve(destination, 'baseline.json'), `${JSON.stringify({ refs, compilerAdjustments }, null, 2)}\n`)
console.log(JSON.stringify({ destination, refs, compilerAdjustments }, null, 2))
