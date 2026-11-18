import { RuleConfigSeverity, type UserConfig } from '@commitlint/types'

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [RuleConfigSeverity.Error, 'always'],
    'header-max-length': [RuleConfigSeverity.Error, 'always', 72],
    'body-empty': [RuleConfigSeverity.Error, 'always'],
    'footer-empty': [RuleConfigSeverity.Error, 'always'],
  },
}

export default config
