import { globalIgnores } from 'eslint/config'
import type { Rule } from 'eslint'
import type { AST } from 'vue-eslint-parser'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'
import json from '@eslint/json'
import css from '@eslint/css'
import type { CSSRuleDefinition } from '@eslint/css'

const commentMessage =
  'Comments are not allowed. Make the code say it, or put it in a commit message.'

const noCodeComments: Rule.RuleModule = {
  meta: {
    type: 'problem',
    schema: [],
    messages: { comment: commentMessage },
  },
  create(context) {
    const { sourceCode } = context

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
            if (child.type !== 'VText') continue
            for (const match of child.value.matchAll(/\/\*[\s\S]*?\*\//g)) {
              const start = child.range[0] + match.index
              context.report({
                loc: {
                  start: sourceCode.getLocFromIndex(start),
                  end: sourceCode.getLocFromIndex(start + match[0].length),
                },
                messageId: 'comment',
              })
            }
          }
        }
      },
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
  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),
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
]
