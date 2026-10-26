import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'

export function auditNativeBundle(publicDirectory) {
  const reportPath = resolve(publicDirectory, '_nuxt/native-bundle.json')
  const metadata = JSON.parse(readFileSync(reportPath, 'utf8'))
  assert.equal(metadata.bootstrap, 'createVaporApp')

  function filesIn(directory) {
    return readdirSync(directory).flatMap(name => {
      const path = resolve(directory, name)

      return statSync(path).isDirectory() ? filesIn(path) : [path]
    })
  }

  // Icon generation and other late build hooks can change published code after
  // generateBundle. Inspect the emitted files, including the worker asset.
  const files = filesIn(publicDirectory).filter(path => /\.m?js$/.test(path))
  const contents = files.map(path => ({ path, content: readFileSync(path) }))
  const code = contents.map(file => file.content.toString('utf8')).join('\n')
  const symbols = ['baseCreateRenderer', 'createVNode', 'ensureRenderer', 'vaporInteropImpl', 'vaporInteropPlugin']
  const report = {
    ...metadata,
    auditStage: 'final-public-assets',
    compiledChunkCount: metadata.compiledChunkCount ?? metadata.chunks.length,
    retainedVDOM: symbols.filter(symbol => new RegExp(`(?:function|const|let|var) ${symbol}\\b`).test(code)),
    chunks: contents.map(({ path, content }) => ({
      file: relative(publicDirectory, path).split(sep).join('/'),
      bytes: content.length,
    })).sort((left, right) => left.file.localeCompare(right.file)),
  }
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify({
    auditStage: report.auditStage,
    compiledUI: report.compiledUI.length,
    javascriptFiles: report.chunks.length,
    javascriptBytes: report.chunks.reduce((sum, chunk) => sum + chunk.bytes, 0),
    retainedVDOM: report.retainedVDOM,
  }, null, 2))
}
