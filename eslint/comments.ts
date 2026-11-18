import type { Linter, Rule } from 'eslint'
import type { AST } from 'vue-eslint-parser'
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

function lineEnd(text: string, from: number): number {
  const newline = text.indexOf('\n', from)
  return newline === -1 ? text.length : newline
}

function quoteEnd(text: string, start: number): number {
  const quote = text.charAt(start)
  let index = start + 1
  while (index < text.length && text.charAt(index) !== quote) {
    index += text.charAt(index) === '\\' ? 2 : 1
  }
  return index + 1
}

function blockCommentEnd(text: string, start: number): number {
  const close = text.indexOf('*/', start + 2)
  return close === -1 ? text.length : close + 2
}

function isLineCommentStart(text: string, index: number, syntax: CommentSyntax): boolean {
  const marker = syntax.lineMarkers.find((candidate) => text.startsWith(candidate, index))
  if (!marker) return false
  const before = text.slice(text.lastIndexOf('\n', index - 1) + 1, index)
  return syntax.lineStartOnly
    ? before.trim() === ''
    : marker === '//' || before === '' || /\s$/.test(before)
}

function commentEnd(text: string, index: number, syntax: CommentSyntax): number | undefined {
  if (syntax.block && text.startsWith('/*', index)) return blockCommentEnd(text, index)
  if (isLineCommentStart(text, index, syntax)) return lineEnd(text, index)
  return undefined
}

function findComments(text: string, syntax: CommentSyntax): [number, number][] {
  const spans: [number, number][] = []
  let index = 0
  while (index < text.length) {
    if (syntax.quotes.includes(text.charAt(index))) {
      index = quoteEnd(text, index)
      continue
    }
    const end = commentEnd(text, index, syntax)
    if (end === undefined) {
      index++
      continue
    }
    spans.push([index, end])
    index = end
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
        const comments = sourceCode.getAllComments()
        for (const comment of comments) {
          if (comment.loc) {
            context.report({ loc: comment.loc, messageId: 'comment' })
          }
        }

        const program = sourceCode.ast as unknown as AST.ESLintProgram
        const templateComments = program.templateBody?.comments ?? []
        for (const comment of templateComments) {
          context.report({ loc: comment.loc, messageId: 'comment' })
        }

        const fragment: AST.VDocumentFragment | null | undefined =
          sourceCode.parserServices?.getDocumentFragment?.()
        const topLevelNodes = fragment?.children ?? []
        for (const node of topLevelNodes) {
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
        const comments = context.sourceCode.comments ?? []
        for (const comment of comments) {
          if (comment.loc) {
            context.report({ loc: comment.loc, messageId: 'comment' })
          }
        }
      },
    }
  },
}

export const commentPlugin = {
  rules: {
    'no-comments': noCodeComments,
    'no-css-comments': noCssComments,
  },
}

const hookNames =
  'applypatch-msg,pre-applypatch,post-applypatch,pre-commit,pre-merge-commit,prepare-commit-msg,commit-msg,post-commit,pre-rebase,post-checkout,post-merge,pre-push,pre-auto-gc,post-rewrite'

const parsedFileTypes = [
  ['app/yaml', ['**/*.{yml,yaml}'], yamlParser],
  ['app/html', ['**/*.html'], htmlParser],
  ['app/shell', [`.husky/{${hookNames}}`], hashCommentParser(shellSyntax)],
  [
    'app/config-files',
    ['**/.gitignore', '**/.gitattributes', '**/.editorconfig', '**/.prettierignore'],
    hashCommentParser(configFileSyntax),
  ],
] as const

export const commentConfigs = [
  {
    name: 'app/css',
    files: ['**/*.css'],
    plugins: { css, local: commentPlugin },
    language: 'css/css',
    languageOptions: { tolerant: true },
    rules: {
      'local/no-css-comments': 'error' as const,
    },
  },
  ...parsedFileTypes.map(([name, files, parser]) => ({
    name,
    files: [...files],
    plugins: { local: commentPlugin },
    languageOptions: { parser },
    rules: { 'local/no-comments': 'error' as const },
  })),
]
