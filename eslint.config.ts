import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'
import unicorn from 'eslint-plugin-unicorn'
import { configs as sonarjsConfigs } from 'eslint-plugin-sonarjs'
import json from '@eslint/json'
import actionlint from 'eslint-plugin-actionlint'
import { commentConfigs, commentPlugin } from './eslint/comments.ts'
import { coreConfigs } from './eslint/core.ts'
import { workflowConfigs } from './eslint/workflows.ts'

const codeFiles = ['**/*.{vue,ts,mts,tsx}']
const testFiles = ['src/**/__tests__/*', 'src/**/*.{test,spec}.ts']

const codeConfigs = defineConfigWithVueTs(
  ...pluginVue.configs['flat/recommended'],
  ...pluginVueA11y.configs['flat/recommended'],
  vueTsConfigs.strictTypeChecked,
  vueTsConfigs.stylisticTypeChecked,
  unicorn.configs.recommended,
  sonarjsConfigs.recommended,
  {
    name: 'app/limits',
    rules: {
      complexity: ['error', 15],
      'max-depth': ['error', 4],
      'max-params': ['error', 4],
      'max-lines-per-function': ['error', { max: 60, skipBlankLines: true }],
      'max-lines': ['error', { max: 300, skipBlankLines: true }],
    },
  },
  {
    name: 'app/accessibility',
    rules: {
      'vuejs-accessibility/label-has-for': ['error', { required: { some: ['nesting', 'id'] } }],
    },
  },
  {
    name: 'app/file-names',
    rules: {
      'unicorn/filename-case': ['error', { case: 'kebabCase', ignore: ['^__tests__$'] }],
    },
  },
  {
    name: 'app/component-file-names',
    files: ['**/*.vue'],
    rules: {
      'unicorn/filename-case': ['error', { case: 'pascalCase', checkDirectories: false }],
    },
  },

  {
    ...pluginVitest.configs.recommended,
    files: testFiles,
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  {
    name: 'app/no-comments',
    plugins: { local: commentPlugin },
    rules: {
      'local/no-comments': 'error',
      'vue/comment-directive': 'off',
    },
  },
  ...coreConfigs,
  {
    name: 'app/no-skipped-tests',
    files: testFiles,
    rules: {
      'vitest/no-disabled-tests': 'error',
      'vitest/no-focused-tests': 'error',
      'vitest/warn-todo': 'error',
      'vitest/prefer-strict-equal': 'error',
      'vitest/no-conditional-in-test': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'SwitchStatement',
          message: 'Do not branch in tests. Write one test per case.',
        },
        {
          selector: 'ConditionalExpression',
          message: 'Do not branch in tests. Write one test per case.',
        },
      ],
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
  ...commentConfigs,
  actionlint.configs.actionlintOnly,
  ...workflowConfigs,
]
