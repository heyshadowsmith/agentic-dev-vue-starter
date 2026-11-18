import type { Linter } from 'eslint'
import functional from 'eslint-plugin-functional'

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

export const coreConfigs: Linter.Config[] = [
  {
    name: 'app/core',
    files: ['src/core/**/*.{ts,mts,tsx}'],
    ignores: coreTestFiles,
    plugins: { functional },
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
      'unicorn/no-array-reduce': 'off',
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
]
