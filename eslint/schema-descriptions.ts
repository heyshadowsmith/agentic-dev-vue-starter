import type { Linter, Rule } from 'eslint'
import type { CallExpression, Expression, Node, Property, SpreadElement } from 'estree'

type ValibotNames = Readonly<{ namespaces: Set<string>; named: Map<string, string> }>

const objectSchemas = new Set(['object', 'looseObject', 'strictObject', 'objectWithRest'])

const valibotName = (callee: Node, names: ValibotNames): string | undefined => {
  if (callee.type === 'Identifier') return names.named.get(callee.name)
  if (
    callee.type === 'MemberExpression' &&
    callee.object.type === 'Identifier' &&
    names.namespaces.has(callee.object.name) &&
    callee.property.type === 'Identifier'
  ) {
    return callee.property.name
  }
  return undefined
}

const isValibotCall = (
  node: Expression | SpreadElement | undefined,
  name: string,
  names: ValibotNames,
): node is CallExpression =>
  node?.type === 'CallExpression' && valibotName(node.callee, names) === name

const hasText = (node: Expression | SpreadElement | undefined): boolean =>
  (node?.type === 'Literal' && typeof node.value === 'string' && node.value.trim() !== '') ||
  (node?.type === 'TemplateLiteral' && node.quasis.some((quasi) => quasi.value.raw.trim() !== ''))

const isDescribed = (value: Property['value'], names: ValibotNames): boolean =>
  value.type === 'CallExpression' &&
  valibotName(value.callee, names) === 'pipe' &&
  value.arguments.some(
    (argument) => isValibotCall(argument, 'description', names) && hasText(argument.arguments[0]),
  )

const describedFields: Rule.RuleModule = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      undescribed:
        'Describe "{{field}}" with v.pipe(..., v.description("...")). Give the meaning that the app uses and its source. If the vendor documents none, say so.',
    },
  },
  create(context) {
    const names: ValibotNames = { namespaces: new Set(), named: new Map() }
    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'valibot') return
        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportNamespaceSpecifier')
            names.namespaces.add(specifier.local.name)
          if (specifier.type === 'ImportSpecifier' && specifier.imported.type === 'Identifier') {
            names.named.set(specifier.local.name, specifier.imported.name)
          }
        }
      },
      CallExpression(node) {
        const name = valibotName(node.callee, names)
        const shape = node.arguments[0]
        if (name === undefined || !objectSchemas.has(name) || shape?.type !== 'ObjectExpression') {
          return
        }
        for (const property of shape.properties) {
          if (property.type !== 'Property' || isDescribed(property.value, names)) continue
          const field = context.sourceCode.getText(property.key)
          context.report({ node: property, messageId: 'undescribed', data: { field } })
        }
      },
    }
  },
}

export const schemaDescriptionConfigs: Linter.Config[] = [
  {
    name: 'app/schema-descriptions',
    files: ['src/adapters/*/schema.ts'],
    plugins: { schemas: { rules: { 'described-fields': describedFields } } },
    rules: { 'schemas/described-fields': 'error' },
  },
]
