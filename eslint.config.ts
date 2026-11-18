import { globalIgnores } from 'eslint/config'
import type { Linter, Rule } from 'eslint'
import type { AST } from 'vue-eslint-parser'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'
import functional from 'eslint-plugin-functional'
import json from '@eslint/json'
import css from '@eslint/css'
import type { CSSRuleDefinition } from '@eslint/css'
import * as yamlParser from 'yaml-eslint-parser'
import * as htmlParser from '@html-eslint/parser'

const commentMessage =
  'Comments are not allowed. Make the code say it, or write it in a Markdown file.'

interface CommentSyntax {
  lineMarkers: string[]
  block?: boolean
  quotes: string
  lineStartOnly?: boolean
}

const jsSyntax: CommentSyntax = { lineMarkers: ['//'], block: true, quotes: '\'"`' }
const cssSyntax: CommentSyntax = { lineMarkers: [], block: true, quotes: '\'"' }
const shellSyntax: CommentSyntax = { lineMarkers: ['#'], quotes: '\'"' }
const configFileSyntax: CommentSyntax = {
  lineMarkers: ['#', ';'],
  quotes: '',
  lineStartOnly: true,
}

function findComments(text: string, syntax: CommentSyntax): [number, number][] {
  const spans: [number, number][] = []
  let quote = ''
  for (let index = 0; index < text.length; index++) {
    const char = text.charAt(index)
    if (quote) {
      if (char === '\\') index++
      else if (char === quote) quote = ''
      continue
    }
    if (syntax.quotes.includes(char)) {
      quote = char
      continue
    }
    if (syntax.block && text.startsWith('/*', index)) {
      const close = text.indexOf('*/', index + 2)
      const end = close === -1 ? text.length : close + 2
      spans.push([index, end])
      index = end - 1
      continue
    }
    const marker = syntax.lineMarkers.find((candidate) => text.startsWith(candidate, index))
    if (marker) {
      const before = text.slice(text.lastIndexOf('\n', index - 1) + 1, index)
      const startsComment = syntax.lineStartOnly
        ? before.trim() === ''
        : marker === '//' || before === '' || /\s$/.test(before)
      if (startsComment) {
        const newline = text.indexOf('\n', index)
        const end = newline === -1 ? text.length : newline
        spans.push([index, end])
        index = end
      }
    }
  }
  return spans
}

function hashCommentParser(syntax: CommentSyntax): Linter.Parser {
  return {
    meta: { name: 'hash-comments' },
    parseForESLint(text: string) {
      const locAt = (index: number) => {
        const lines = text.slice(0, index).split('\n')
        return { line: lines.length, column: lines.at(-1)?.length ?? 0 }
      }
      const comments = findComments(text, syntax).map(([start, end]) => ({
        type: 'Line' as const,
        value: text.slice(start, end),
        range: [start, end] as [number, number],
        loc: { start: locAt(start), end: locAt(end) },
      }))
      return {
        ast: {
          type: 'Program' as const,
          body: [],
          sourceType: 'script' as const,
          comments,
          tokens: [],
          range: [0, text.length] as [number, number],
          loc: { start: { line: 1, column: 0 }, end: locAt(text.length) },
        },
      }
    },
  }
}

interface TextNode {
  value: string
  range: [number, number]
}

const noCodeComments: Rule.RuleModule = {
  meta: {
    type: 'problem',
    schema: [],
    messages: { comment: commentMessage },
  },
  create(context) {
    const { sourceCode } = context

    const reportSpans = (offset: number, text: string, syntax: CommentSyntax) => {
      for (const [start, end] of findComments(text, syntax)) {
        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(offset + start),
            end: sourceCode.getLocFromIndex(offset + end),
          },
          messageId: 'comment',
        })
      }
    }

    const reportEmbedded = (syntax: CommentSyntax) => (node: unknown) => {
      const { value, range } = node as TextNode
      reportSpans(range[0], value, syntax)
    }

    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          if (comment.loc) {
            context.report({ loc: comment.loc, messageId: 'comment' })
          }
        }

        const program = sourceCode.ast as unknown as AST.ESLintProgram
        for (const comment of program.templateBody?.comments ?? []) {
          context.report({ loc: comment.loc, messageId: 'comment' })
        }

        const fragment: AST.VDocumentFragment | null | undefined =
          sourceCode.parserServices?.getDocumentFragment?.()
        for (const node of fragment?.children ?? []) {
          if (node.type !== 'VElement' || node.name !== 'style') continue
          for (const child of node.children) {
            if (child.type === 'VText') reportSpans(child.range[0], child.value, cssSyntax)
          }
        }
      },
      ScriptTagContent: reportEmbedded(jsSyntax),
      StyleTagContent: reportEmbedded(cssSyntax),
    }
  },
}

const noCssComments: CSSRuleDefinition = {
  meta: {
    type: 'problem',
    messages: { comment: commentMessage },
  },
  create(context) {
    return {
      StyleSheet() {
        for (const comment of context.sourceCode.comments ?? []) {
          if (comment.loc) {
            context.report({ loc: comment.loc, messageId: 'comment' })
          }
        }
      },
    }
  },
}

const codeFiles = ['**/*.{vue,ts,mts,tsx}']

const coreTestFiles = ['src/core/**/__tests__/**', 'src/core/**/*.{test,spec}.{ts,mts,tsx}']

const coreRestrictedGlobals = [
  'window',
  'document',
  'navigator',
  'location',
  'history',
  'globalThis',
  'self',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'caches',
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'EventSource',
  'console',
  'alert',
  'confirm',
  'prompt',
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'requestIdleCallback',
  'queueMicrotask',
  'crypto',
  'performance',
  'process',
].map((name) => ({ name, message: 'src/core/ must be pure. Do this in the shell.' }))

const local = {
  rules: {
    'no-comments': noCodeComments,
    'no-css-comments': noCssComments,
  },
}

const codeConfigs = defineConfigWithVueTs(
  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*', 'src/**/*.{test,spec}.ts'],
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  {
    name: 'app/no-comments',
    plugins: { local },
    rules: {
      'local/no-comments': 'error',
      'vue/comment-directive': 'off',
    },
  },
  {
    name: 'app/core',
    files: ['src/core/**/*.{ts,mts,tsx}'],
    ignores: coreTestFiles,
    plugins: { functional },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?!\\./|@/core/)|(^|/)\\.\\.(/|$)',
              message: 'src/core/ may only import from src/core/, using ./ or @/core/.',
            },
          ],
        },
      ],
      'no-restricted-globals': ['error', ...coreRestrictedGlobals],
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Pass randomness in from the shell.' },
        { object: 'Date', property: 'now', message: 'Pass the current time in from the shell.' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message: 'Pass the current time in from the shell.',
        },
        {
          selector: "CallExpression[callee.name='Date']",
          message: 'Pass the current time in from the shell.',
        },
        { selector: ':function[async=true]', message: 'src/core/ must be synchronous.' },
        { selector: 'AwaitExpression', message: 'src/core/ must be synchronous.' },
        { selector: 'ImportExpression', message: 'src/core/ may not import dynamically.' },
      ],
      'functional/no-let': 'error',
      'functional/immutable-data': 'error',
      'functional/no-loop-statements': 'error',
      'functional/no-classes': 'error',
      'functional/no-this-expressions': 'error',
      'functional/no-throw-statements': 'error',
      'functional/no-try-statements': 'error',
      'functional/no-promise-reject': 'error',
      'functional/no-expression-statements': 'error',
      'functional/no-return-void': 'error',
      'functional/functional-parameters': 'error',
    },
  },
  {
    name: 'app/core-no-components',
    files: ['src/core/**/*.vue'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: 'Program', message: 'Components belong in the shell, outside src/core/.' },
      ],
    },
  },
  {
    name: 'app/no-skipped-tests',
    files: ['src/**/__tests__/*', 'src/**/*.{test,spec}.ts'],
    rules: {
      'vitest/no-disabled-tests': 'error',
      'vitest/no-focused-tests': 'error',
      'vitest/warn-todo': 'error',
    },
  },

  skipFormatting,
).map((config) => (config.files ? config : { ...config, files: codeFiles }))

export default [
  globalIgnores([
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    '.husky/_/**',
    'pnpm-lock.yaml',
  ]),
  ...codeConfigs,
  {
    name: 'app/no-inline-config',
    linterOptions: {
      noInlineConfig: true,
    },
  },
  {
    name: 'app/json',
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
  },
  {
    name: 'app/css',
    files: ['**/*.css'],
    plugins: { css, local },
    language: 'css/css',
    languageOptions: { tolerant: true },
    rules: {
      'local/no-css-comments': 'error',
    },
  },
  ...(
    [
      ['app/yaml', ['**/*.{yml,yaml}'], yamlParser],
      ['app/html', ['**/*.html'], htmlParser],
      [
        'app/shell',
        [
          '.husky/{applypatch-msg,pre-applypatch,post-applypatch,pre-commit,pre-merge-commit,prepare-commit-msg,commit-msg,post-commit,pre-rebase,post-checkout,post-merge,pre-push,pre-auto-gc,post-rewrite}',
        ],
        hashCommentParser(shellSyntax),
      ],
      [
        'app/config-files',
        ['**/.gitignore', '**/.gitattributes', '**/.editorconfig'],
        hashCommentParser(configFileSyntax),
      ],
    ] as const
  ).map(([name, files, parser]) => ({
    name,
    files: [...files],
    plugins: { local },
    languageOptions: { parser },
    rules: { 'local/no-comments': 'error' as const },
  })),
]
