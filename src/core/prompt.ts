export type ChangeKind = 'feat' | 'fix' | 'refactor'

export interface PromptOptions {
  readonly task: string
  readonly kind: ChangeKind
  readonly testsFirst: boolean
  readonly pureCore: boolean
  readonly askBeforeDependencies: boolean
  readonly openPullRequest: boolean
}

const placeholderTask = 'Describe the change here.'

const kindVerbs: Readonly<Record<ChangeKind, string>> = {
  feat: 'Build this feature',
  fix: 'Fix this bug',
  refactor: 'Refactor this code',
}

const optionalLines = (options: PromptOptions): readonly string[] =>
  [
    [options.testsFirst, 'Write the failing tests first, then make them pass.'],
    [options.pureCore, 'Put pure logic in src/core and keep its coverage at 100%.'],
    [options.askBeforeDependencies, 'Stop and ask me before you add a dependency.'],
    [options.openPullRequest, 'Open a pull request when every check passes.'],
  ]
    .filter(([isOn]) => isOn === true)
    .map(([, line]) => String(line))

export const buildPrompt = (options: PromptOptions): string => {
  const task = options.task.trim() === '' ? placeholderTask : options.task.trim()
  return [
    'Read AGENTS.md before you change any code.',
    '',
    `${kindVerbs[options.kind]}: ${task}`,
    '',
    `Use a "${options.kind}: ..." commit title with no scope, body or trailers.`,
    'Run the checks before each commit and fix every error they report.',
    ...optionalLines(options),
  ].join('\n')
}

export const isChangeKind = (value: unknown): value is ChangeKind =>
  value === 'feat' || value === 'fix' || value === 'refactor'
