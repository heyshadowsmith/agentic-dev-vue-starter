import type { UserConfig } from '@commitlint/types'

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [2, 'always'],
    'header-max-length': [2, 'always', 72],
    'body-empty': [2, 'always'],
    'footer-empty': [2, 'always'],
  },
}

export default config
