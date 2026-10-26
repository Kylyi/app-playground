import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import process from 'node:process'
import { babelParse, parse } from '@vue/compiler-sfc'

// Audit application-owned calls, rather than counting copied UI/Utilities layers
// as consumers of themselves. No consumer checkout is modified.
const root = resolve(process.argv[2] ?? '..')
const output = resolve(process.argv[3] ?? '/tmp/vapor-consumer-audit.json')
const excludedProjectRoots = new Set(process.argv.slice(4))
const workspace = resolve(import.meta.dirname, '../..')
const files = execFileSync('rg', ['--files', root, '-g', '*.vue', '-g', '*.ts', '-g', '*.tsx', '-g', '!node_modules', '-g', '!.nuxt', '-g', '!.output', '-g', '!dist', '-g', '!coverage', '-g', '!vendor', '-g', '!*.d.ts', '-g', '!*.spec.ts', '-g', '!*.test.ts'], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim().split('\n')
const excluded = /\/(?:libs|layers|packages)\/(?:UI|Utilities)\//
const relevant = /\b(?:initRef|initLegacyRef|useRefReset|useDialogLayout|createComponent)\b|\$hide\b|<Table\b|<table\b/
const calls = []
const tables = []
const unresolved = []
const parseErrors = []
const templates = []
const projects = new Map()

function walk(node, visit) {
  if (!node || typeof node !== 'object') {
    return
  }
  if (typeof node.type === 'string' || typeof node.type === 'number') {
    visit(node)
  }
  for (const [key, child] of Object.entries(node)) {
    if (['loc', 'comments', 'tokens', 'errors'].includes(key)) {
      continue
    }
    if (Array.isArray(child)) {
      child.forEach(value => walk(value, visit))
    } else if (child && typeof child === 'object') {
      walk(child, visit)
    }
  }
}

function propertyNames(argument, variables) {
  if (argument?.type === 'Identifier') {
    argument = variables.get(argument.name)
  }
  if (argument?.type !== 'ObjectExpression') {
    return undefined
  }

  return argument.properties.flatMap(property => {
    return property.type === 'SpreadElement'
      ? ['...spread']
      : [property.key?.name ?? property.key?.value].filter(Boolean)
  })
}

function inspectScript(source, context) {
  const ast = babelParse(source, {
    sourceType: 'unambiguous',
    plugins: ['typescript', 'jsx', 'decorators-legacy'],
    allowReturnOutsideFunction: true,
  })
  const variables = new Map()
  const aliases = new Map()
  walk(ast, node => {
    if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') {
      variables.set(node.id.name, node.init)
    }
    if (node.type === 'ImportSpecifier') {
      aliases.set(node.local.name, node.imported.name ?? node.imported.value)
    }
  })
  walk(ast, node => {
    if (node.type !== 'CallExpression' && node.type !== 'OptionalCallExpression') {
      return
    }
    const name = node.callee.type === 'Identifier'
      ? aliases.get(node.callee.name) ?? node.callee.name
      : node.callee.property?.name
    if (!['initRef', 'initLegacyRef', 'useRefReset', '$hide', 'useDialogLayout', 'createComponent'].includes(name)) {
      return
    }
    const options = propertyNames(node.arguments[name === 'useRefReset' ? 1 : 0], variables)
    const call = { ...context, line: context.offset + node.loc.start.line, name, options, arguments: node.arguments.length }
    if ((name === 'initRef' && options?.includes('instance')) || name === 'initLegacyRef') {
      call.contract = 'legacy-instance-model'
    } else if (name === '$hide' && options?.includes('instance')) {
      call.contract = 'hide-instance-needs-explicit-target'
    } else if (name === 'useRefReset' && options?.includes('emitName')) {
      call.contract = 'reset-emit-name-needs-callback'
    } else if (name === 'useDialogLayout' && node.arguments.length < 3) {
      call.contract = 'dialog-layout-needs-host'
    }
    if (name !== 'useDialogLayout' && node.arguments.length && !options && name !== 'useRefReset') {
      unresolved.push(call)
    }
    calls.push(call)
  })
}

for (const file of files) {
  const path = relative(root, file)
  if (file.startsWith(`${workspace}/`) || excluded.test(file)
    || /^(?:ui|utilities|utils-migrations)\//.test(path)) {
    continue
  }
  const project = path.split('/')[0]
  if (excludedProjectRoots.has(project)) {
    continue
  }
  projects.set(project, (projects.get(project) ?? 0) + 1)
  let source = readFileSync(file, 'utf8')
  if (!relevant.test(source)) {
    continue
  }
  if (file.includes('/_templates/')) {
    templates.push(path)
    source = source.replace(/\[FTName(?:\s*%\s*\w+)?\]/g, 'AuditRecord')
  }
  try {
    const context = { project, file: path, offset: 0 }
    if (file.endsWith('.vue')) {
      const { descriptor, errors } = parse(source, { filename: file })
      if (errors.length) {
        throw new Error(errors.map(String).join('; '))
      }
      for (const script of [descriptor.script, descriptor.scriptSetup].filter(Boolean)) {
        inspectScript(script.content, { ...context, offset: script.loc.start.line - 1 })
      }
      walk(descriptor.template?.ast, node => {
        if (node.type === 1 && node.tag === 'Table') {
          const explicitStorage = node.props.some(prop => prop.name === 'storage-key'
            || (prop.name === 'bind' && ['storage-key', 'storageKey'].includes(prop.arg?.content)))
          const spreads = node.props.some(prop => prop.name === 'bind' && !prop.arg)
          tables.push({ ...context, line: node.loc.start.line, explicitStorage, spreads })
        }
        for (const prop of node.props ?? []) {
          if (prop.type === 7 && prop.exp?.content.includes('$hide')) {
            inspectScript(prop.exp.content, { ...context, offset: prop.exp.loc.start.line - 1 })
          }
        }
      })
    } else {
      inspectScript(source, context)
    }
  } catch (error) {
    parseErrors.push({ file: path, error: String(error) })
  }
}

const report = {
  root,
  scannedAt: new Date().toISOString(),
  scope: 'Local application and non-UI layer source; vendored UI/Utilities, generated output and tests excluded',
  excludedProjectRoots: [...excludedProjectRoots].sort(),
  projects: Object.fromEntries([...projects].sort()),
  sourceFiles: [...projects.values()].reduce((total, count) => total + count, 0),
  calls,
  tables,
  unresolved,
  parseErrors,
  templates,
}
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({
  output,
  projects: projects.size,
  sourceFiles: report.sourceFiles,
  calls: calls.length,
  contracts: Object.fromEntries([...new Set(calls.map(call => call.contract).filter(Boolean))]
    .map(contract => [contract, calls.filter(call => call.contract === contract).length])),
  tables: tables.length,
  withoutExplicitStorage: tables.filter(table => !table.explicitStorage).length,
  unresolved: unresolved.length,
  parseErrors: parseErrors.length,
}, null, 2))
