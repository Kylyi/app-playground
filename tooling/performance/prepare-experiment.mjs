import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const workspace = resolve(import.meta.dirname, '../..')
const [name, phase] = process.argv.slice(2)
assert.match(name ?? '', /^[a-z][a-z0-9-]+$/)
assert.ok(['before', 'after'].includes(phase))
const directory = resolve(
  workspace,
  process.env.VAPOR_PERFORMANCE_EXPERIMENT_DIRECTORY ?? '.cache/vapor-performance-experiments',
  name,
)
const destination = resolve(directory, phase)
assert.equal(existsSync(destination), false, 'Frozen experiment sources must not be overwritten')
mkdirSync(destination, { recursive: true })
symlinkSync(resolve(workspace, 'node_modules'), resolve(destination, 'node_modules'), 'dir')
const ignored = new Set(['.git', '.nuxt', '.output', '.cache', 'node_modules'])
const nuxtCLI = fileURLToPath(new URL('bin/nuxt.mjs', import.meta.resolve('nuxt/package.json')))
for (const layer of ['UI', 'Utilities']) {
  cpSync(resolve(workspace, 'packages', layer), resolve(destination, layer), {
    recursive: true,
    filter: path => !ignored.has(basename(path)) && !basename(path).startsWith('.env'),
  })
}
for (const layer of ['Utilities', 'UI']) {
  execFileSync(process.execPath, [nuxtCLI, 'prepare', resolve(destination, layer)], {
    cwd: workspace,
    stdio: 'inherit',
    env: { ...process.env, GENTL_PREPARING_NUXT_LAYERS: 'true', NUXT_DOTENV_DIR: workspace },
  })
}
execFileSync(process.execPath, [resolve(import.meta.dirname, 'prepare-current-vdom.mjs')], {
  cwd: workspace,
  stdio: 'inherit',
  env: { ...process.env, VAPOR_PERFORMANCE_SOURCE: destination, VAPOR_PERFORMANCE_VDOM_DIRECTORY: `${destination}-vdom` },
})
const control = JSON.parse(readFileSync(resolve(`${destination}-vdom`, 'source.json'), 'utf8'))
for (const [file, sha256] of Object.entries(control.sources)) {
  assert.equal(createHash('sha256').update(readFileSync(resolve(destination, file))).digest('hex'), sha256)
}
writeFileSync(resolve(destination, 'source.json'), `${JSON.stringify({
  method: 'Frozen working layers before/after one measured experiment',
  sources: control.sources,
  sha256: control.sha256,
}, null, 2)}\n`)
const experiment = {
  name,
  variants: Object.fromEntries([
    ['before-vdom', 'before', 'vdom', 3023],
    ['before-vapor', 'before', 'vapor', 3024],
    ['after-vdom', 'after', 'vdom', 3026],
    ['after-vapor', 'after', 'vapor', 3025],
  ].map(([variant, stage, compiler, port]) => {
    const source = resolve(directory, stage)
    const file = resolve(source, 'source.json')

    return [variant, {
      url: `http://127.0.0.1:${port}`,
      parent: compiler,
      library: `${name}/${stage}`,
      compiler,
      source,
      layers: compiler === 'vdom' ? `${source}-vdom` : source,
      sourceSha256: existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')).sha256 : null,
    }]
  })),
}
writeFileSync(resolve(directory, 'experiment.json'), `${JSON.stringify(experiment, null, 2)}\n`)
console.log(`Prepared immutable ${name}/${phase}; ${control.compilerAdjustments.length} VDOM marker removals.`)
