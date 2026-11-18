import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*', 'src/**/*.{test,spec}.ts'],
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  // Block suppressions. These come after the Oxlint config, which turns off ESLint
  // rules that Oxlint covers, so it can't switch them off.
  {
    name: 'app/no-suppressions',
    linterOptions: {
      noInlineConfig: true,
    },
    rules: {
      // Oxlint still honors disable comments, so ban them, along with other tools' ignores.
      'no-warning-comments': [
        'error',
        {
          location: 'anywhere',
          terms: [
            'eslint-disable',
            'eslint-enable',
            'oxlint-disable',
            'oxlint-enable',
            'prettier-ignore',
            'secretlint-disable',
            'istanbul ignore',
            'v8 ignore',
            'c8 ignore',
          ],
        },
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-check': false,
          'ts-expect-error': true,
          'ts-ignore': true,
          'ts-nocheck': true,
        },
      ],
      // Disable comments in Vue templates go through this rule, not noInlineConfig.
      // Turning it off makes them do nothing.
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
)
