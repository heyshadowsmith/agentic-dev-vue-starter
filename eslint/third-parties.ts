import type { Linter } from 'eslint'

const adapterMessage = 'Call third-party APIs only from an adapter in src/adapters/.'
const networkGlobals = ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource']

const validationImport = {
  group: ['valibot', 'valibot/*'],
  message: 'Check third-party data only in an adapter in src/adapters/.',
}

const clientImport = {
  regex: '(^|/)adapters/[^/]+/client$',
  message: 'Import an adapter client only in src/main.ts. Elsewhere, inject its port.',
}

export const thirdPartyConfigs: Linter.Config[] = [
  {
    name: 'app/third-parties',
    files: ['src/**/*.{ts,mts,tsx,vue}'],
    ignores: ['src/core/**', 'src/adapters/**'],
    rules: {
      'no-restricted-globals': [
        'error',
        ...networkGlobals.map((name) => ({ name, message: adapterMessage })),
      ],
      'no-restricted-properties': [
        'error',
        ...['window', 'globalThis', 'self'].flatMap((object) =>
          networkGlobals.map((property) => ({ object, property, message: adapterMessage })),
        ),
      ],
      'no-restricted-imports': ['error', { patterns: [validationImport, clientImport] }],
    },
  },
  {
    name: 'app/third-party-wiring',
    files: ['src/main.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [validationImport] }],
    },
  },
]
