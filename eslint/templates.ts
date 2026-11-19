import type { Linter, Rule } from 'eslint'
import type { AST } from 'vue-eslint-parser'

interface TemplateServices {
  defineTemplateBodyVisitor?: (visitor: Record<string, (node: never) => void>) => Rule.RuleListener
}

const hasPreDirective = (element: AST.VElement): boolean =>
  element.startTag.attributes.some(
    (attribute) => attribute.directive && attribute.key.name.name === 'pre',
  )

const noMustacheInPre: Rule.RuleModule = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      mustache:
        'Prettier adds spaces inside {{ }} in v-pre text and changes what the page shows. Put the text in a script constant and render it with {{ }}.',
    },
  },
  create(context) {
    const services = context.sourceCode.parserServices as TemplateServices | undefined
    if (services?.defineTemplateBodyVisitor === undefined) return {}
    return services.defineTemplateBodyVisitor({
      VElement: (element: AST.VElement) => {
        if (!hasPreDirective(element)) return
        const text = context.sourceCode.text.slice(element.startTag.range[1], element.range[1])
        if (!text.includes('{{')) return
        context.report({ loc: element.loc, messageId: 'mustache' })
      },
    })
  },
}

export const templateConfigs: Linter.Config[] = [
  {
    name: 'app/templates',
    files: ['**/*.vue'],
    plugins: { templates: { rules: { 'no-mustache-in-pre': noMustacheInPre } } },
    rules: { 'templates/no-mustache-in-pre': 'error' },
  },
]
