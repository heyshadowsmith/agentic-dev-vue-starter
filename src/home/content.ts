export interface Question {
  readonly id: string
  readonly question: string
  readonly answer: string
}

export interface StackItem {
  readonly name: string
  readonly role: string
}

export const repositoryName = 'heyshadowsmith/agentic-dev-vue-starter'

export const repositoryUrl = `https://github.com/${repositoryName}`

export const templateUrl = `${repositoryUrl}/generate`

export const quickStart = 'pnpm install\npnpm dev'

export const sections = [
  { id: 'prompt', index: '01', title: 'Prompt' },
  { id: 'checks', index: '02', title: 'Checks' },
  { id: 'ci-run', index: '03', title: 'CI run' },
  { id: 'project', index: '04', title: 'Project map' },
  { id: 'questions', index: '05', title: 'Why so strict' },
  { id: 'stack', index: '06', title: 'Stack' },
] as const

export const questions: readonly Question[] = [
  {
    id: 'comments',
    question: 'Why ban comments in code?',
    answer:
      'Comments drift from the code they describe, and agents trust them. Names and tests say what code does. AGENTS.md and other Markdown files say why.',
  },
  {
    id: 'prose',
    question: 'Why Simplified Technical English?',
    answer:
      'Short sentences with one meaning each are easier for people and models to follow. ste-lint checks the rules, so nobody has to argue about style.',
  },
  {
    id: 'commits',
    question: 'Why title-only commits?',
    answer:
      'The title says what changed. The pull request holds the discussion. Bodies written by agents tend to repeat the diff.',
  },
  {
    id: 'release-age',
    question: 'Why wait 24 hours for new package versions?',
    answer:
      'Most malicious releases are found and pulled within a day. pnpm refuses versions younger than 24 hours, so a bad release rarely reaches the lock file.',
  },
  {
    id: 'core',
    question: 'Why a functional core?',
    answer:
      'Pure functions are cheap to test to 100%, and an agent cannot hide a side effect in them. The shell stays thin, so most bugs land where tests catch them.',
  },
]

export const stack: readonly StackItem[] = [
  { name: 'Vue 3.5', role: 'UI framework' },
  { name: 'TypeScript', role: 'Strictest settings, plus strict templates' },
  { name: 'Vite', role: 'Dev server and build' },
  { name: 'ui-sdk', role: 'Accessible, agent-ready components' },
  { name: 'Tailwind CSS 4', role: 'Utility styles' },
  { name: 'Vue Router', role: 'Routes' },
  { name: 'Pinia', role: 'State' },
  { name: 'Vitest', role: 'Tests and core coverage' },
  { name: 'pnpm', role: 'Packages, with a 24-hour release age' },
]
