// A deliberately scoped guardrail, not a compatibility certification.
export const rendererIndependent = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      instance: 'Pass model refs, emit callbacks or DOM refs explicitly; Vapor has no VDOM instance.',
      member: 'VDOM member {{name}} is not a portable Vapor contract. Expose a specific API.',
      model: 'Pass an explicit emit callback to useVModel/useVModels.',
      lifecycle: 'Use a template ref and lifecycle hook instead of @vue:* element events.',
    },
  },
  create(context) {
    const source = context.sourceCode
    const services = source.parserServices
    const document = services.getDocumentFragment?.()
    const marked = document?.children.some(node =>
      node.type === 'VElement'
      && ['script', 'template'].includes(node.name)
      && node.startTag.attributes.some(attr => !attr.directive && attr.key.name === 'vapor'),
    ) || source.getAllComments().some(comment => /@vapor-ready\b/.test(comment.value))
    if (!marked) {
      return {}
    }

    const names = new Map([
      ['getCurrentInstance', 'getCurrentInstance'],
      ['useVModel', 'useVModel'],
      ['useVModels', 'useVModels'],
    ])
    const namespaces = new Set()
    const script = {
      ImportDeclaration(node) {
        if (!['vue', '@vueuse/core', '@vueuse/shared'].includes(node.source.value)) {
          return
        }
        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportNamespaceSpecifier') {
            namespaces.add(specifier.local.name)
          } else if (specifier.type === 'ImportSpecifier') {
            names.set(specifier.local.name, specifier.imported.name)
          }
        }
      },
      CallExpression(node) {
        const callee = node.callee
        const name = callee.type === 'Identifier'
          ? names.get(callee.name)
          : callee.type === 'MemberExpression' && namespaces.has(callee.object.name)
            ? (callee.computed ? callee.property.value : callee.property.name)
            : undefined
        if (name === 'getCurrentInstance') {
          context.report({ node, messageId: 'instance' })
        }
        if (name === 'useVModel' || name === 'useVModels') {
          const emit = node.arguments[name === 'useVModel' ? 2 : 1]
          if (!emit || (emit.type === 'Identifier' && emit.name === 'undefined') || (emit.type === 'Literal' && emit.value === null)) {
            context.report({ node, messageId: 'model' })
          }
        }
      },
      MemberExpression(node) {
        const name = node.computed ? node.property.value : node.property.name
        if (['vnode', 'subTree', '$el', '$props', '$attrs', '$slots', '$refs'].includes(name)) {
          context.report({ node, messageId: 'member', data: { name } })
        }
      },
    }
    const template = {
      VAttribute(node) {
        if (node.directive && node.key.name.name === 'on' && node.key.argument?.type === 'VIdentifier'
          && node.key.argument.name.startsWith('vue:')) {
          context.report({ node, messageId: 'lifecycle' })
        }
      },
      MemberExpression: script.MemberExpression,
      CallExpression: script.CallExpression,
    }

    return services.defineTemplateBodyVisitor?.(template, script) ?? script
  },
}

export default { rules: { 'renderer-independent': rendererIndependent } }
