import type { Linter, Rule } from 'eslint'
import { getStaticYAMLValue, type AST } from 'yaml-eslint-parser'
import * as yamlParser from 'yaml-eslint-parser'

const pinnedAction = /^[^@\s]+@[\da-f]{40}$/
const pinnedImage = /^docker:\/\/[^@\s]+@sha256:[\da-f]{64}$/

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const keyName = (pair: AST.YAMLPair): string | undefined =>
  pair.key?.type === 'YAMLScalar' && typeof pair.key.value === 'string' ? pair.key.value : undefined

const stringValue = (pair: AST.YAMLPair): string | undefined =>
  pair.value?.type === 'YAMLScalar' && typeof pair.value.value === 'string'
    ? pair.value.value
    : undefined

const isPinned = (reference: string): boolean =>
  reference.startsWith('./') || pinnedAction.test(reference) || pinnedImage.test(reference)

const triggers = (on: unknown): string[] => {
  if (typeof on === 'string') return [on]
  if (Array.isArray(on)) return on.filter((trigger) => typeof trigger === 'string')
  return isRecord(on) ? Object.keys(on) : []
}

const checkPair = (context: Rule.RuleContext, pair: AST.YAMLPair) => {
  const name = keyName(pair)
  const value = stringValue(pair)
  if (value === undefined) return
  if (name === 'uses' && !isPinned(value)) {
    context.report({ loc: pair.loc, messageId: 'unpinned', data: { reference: value } })
  }
  if (name === 'run' && value.includes('${{')) {
    context.report({ loc: pair.loc, messageId: 'runExpression' })
  }
}

const checkStep = (context: Rule.RuleContext, mapping: AST.YAMLMapping) => {
  const step = getStaticYAMLValue(mapping)
  if (
    !isRecord(step) ||
    typeof step['uses'] !== 'string' ||
    !step['uses'].startsWith('actions/checkout@')
  ) {
    return
  }
  const inputs = step['with']
  if (isRecord(inputs) && inputs['persist-credentials'] === false) return
  context.report({ loc: mapping.loc, messageId: 'checkoutCredentials' })
}

const checkWorkflow = (context: Rule.RuleContext, document: AST.YAMLDocument) => {
  const workflow = document.content === null ? undefined : getStaticYAMLValue(document.content)
  if (!isRecord(workflow)) return
  if (!('permissions' in workflow)) {
    context.report({ loc: document.loc, messageId: 'permissions' })
  }
  if (triggers(workflow['on']).includes('pull_request_target')) {
    context.report({ loc: document.loc, messageId: 'pullRequestTarget' })
  }
}

const workflowSecurity: Rule.RuleModule = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      unpinned: 'Pin "{{reference}}" to a full 40-character commit SHA.',
      runExpression: 'Do not put ${{ }} expressions in run scripts. Pass the value with env.',
      checkoutCredentials: 'Set persist-credentials: false on actions/checkout.',
      permissions: 'Declare top-level permissions for the workflow.',
      pullRequestTarget: 'Do not use the pull_request_target trigger.',
    },
  },
  create(context) {
    return {
      YAMLPair: (node: unknown) => {
        checkPair(context, node as AST.YAMLPair)
      },
      YAMLMapping: (node: unknown) => {
        checkStep(context, node as AST.YAMLMapping)
      },
      YAMLDocument: (node: unknown) => {
        checkWorkflow(context, node as AST.YAMLDocument)
      },
    }
  },
}

export const workflowConfigs: Linter.Config[] = [
  {
    name: 'app/workflow-security',
    files: ['.github/workflows/*.{yml,yaml}'],
    plugins: { workflows: { rules: { security: workflowSecurity } } },
    languageOptions: { parser: yamlParser },
    rules: { 'workflows/security': 'error' },
  },
]
