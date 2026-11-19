export interface Check {
  readonly tool: string
  readonly catches: string
}

export interface Principle {
  readonly title: string
  readonly body: string
}

export const repositoryUrl = 'https://github.com/heyshadowsmith/agentic-dev-vue-starter'

export const quickStart = 'pnpm install\npnpm dev'

export const commitChecks: readonly Check[] = [
  {
    tool: 'Oxlint and ESLint',
    catches: 'Type-aware bugs, accessibility, core purity and comments in code',
  },
  { tool: 'Prettier', catches: 'Formatting, fixed for you' },
  { tool: 'markdownlint', catches: 'Markdown style and one sentence per line' },
  { tool: 'ste-lint', catches: 'Prose that is not Simplified Technical English' },
  { tool: 'Secretlint', catches: 'Keys and tokens in staged files' },
  { tool: 'commitlint', catches: 'Commit messages that are not a Conventional Commits title' },
  { tool: 'pnpm audit', catches: 'Known vulnerabilities that have a fix' },
]

export const ciChecks: readonly Check[] = [
  { tool: 'vue-tsc', catches: 'Strict types in scripts and templates' },
  { tool: 'Vitest', catches: 'Failing tests and core coverage below 100%' },
  { tool: 'archlint', catches: 'Cycles, layer breaks, complexity and code clones' },
  { tool: 'Knip', catches: 'Unused files, exports, types and dependencies' },
  { tool: 'actionlint and zizmor', catches: 'Workflow mistakes and security risks' },
  { tool: 'pnpm dedupe', catches: 'Duplicate versions in the lock file' },
]

export const principles: readonly Principle[] = [
  {
    title: 'Every rule is a check',
    body: 'Rules live in config, not in review comments. An agent gets the same exact error a person would, before the code leaves the machine.',
  },
  {
    title: 'Functional core, imperative shell',
    body: 'Pure logic goes in src/core with 100% test coverage. Components, stores and the router stay in the shell.',
  },
  {
    title: 'Markdown is the only place for prose',
    body: 'Code has no comments. AGENTS.md holds the rules, in plain English that a linter checks.',
  },
]

export const stack: readonly string[] = [
  'Vue 3.5',
  'TypeScript, strict',
  'Vite',
  'Vue Router',
  'Pinia',
  'Tailwind CSS 4',
  'ui-sdk',
  'Vitest',
  'pnpm',
]
