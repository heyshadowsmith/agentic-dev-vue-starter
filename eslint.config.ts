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

const uiSdkControls = [
  'Autocomplete',
  'Checkbox',
  'ColorPicker',
  'Combobox',
  'DateInput',
  'DatePicker',
  'FileInput',
  'Input',
  'NumberInput',
  'OtpInput',
  'PasswordInput',
  'Radio',
  'Rating',
  'SegmentedControl',
  'Select',
  'Slider',
  'Switch',
  'Textarea',
  'TimeInput',
  'TokenInput',
  'Toggle',
]

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
      'vuejs-accessibility/label-has-for': [
        'error',
        { required: { some: ['nesting', 'id'] }, controlComponents: uiSdkControls },
      ],
      'vuejs-accessibility/form-control-has-label': [
        'error',
        {
          labelComponents: ['Field'],
          controlComponents: uiSdkControls.map((name) =>
            name.replaceAll(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
          ),
        },
      ],
    },
  },
  {
    name: 'app/unicorn-adjustments',
    rules: {
      'unicorn/no-array-sort': 'off',
      'unicorn/no-array-reverse': 'off',
      'unicorn/no-array-splice': 'off',
      'unicorn/prefer-array-find': ['error', { checkFromLast: false }],
      'unicorn/prefer-set-methods': 'off',
      'unicorn/prefer-group-by': 'off',
      'unicorn/prefer-promise-with-resolvers': 'off',
      'unicorn/prefer-array-from-async': 'off',
      'unicorn/consistent-boolean-name': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-array-callback-reference': 'off',
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
      'max-lines-per-function': 'off',
      'unicorn/no-await-expression-member': 'off',
      'unicorn/no-top-level-assignment-in-function': 'off',
      'unicorn/max-nested-calls': 'off',
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

  {
    name: 'app/test-setup',
    files: ['src/__tests__/setup.ts'],
    rules: {
      'unicorn/no-global-object-property-assignment': 'off',
      '@typescript-eslint/no-empty-function': 'off',
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
