type Stage = 'commit' | 'ci'

export type StageFilter = Stage | 'all'

export interface Check {
  readonly id: string
  readonly tool: string
  readonly stage: Stage
  readonly catches: string
  readonly example: string
}

export interface CheckQuery {
  readonly text: string
  readonly stage: StageFilter
}

export type StageCounts = Readonly<Record<StageFilter, number>>

const searchTerms = (text: string): readonly string[] =>
  text
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term !== '')

const matchesText = (check: Check, text: string): boolean => {
  const haystack = [check.tool, check.catches, check.example].join('\n').toLowerCase()
  return searchTerms(text).every((term) => haystack.includes(term))
}

const matchesStage = (check: Check, stage: StageFilter): boolean =>
  stage === 'all' || check.stage === stage

export const filterChecks = (checks: readonly Check[], query: CheckQuery): readonly Check[] =>
  checks.filter((check) => matchesStage(check, query.stage) && matchesText(check, query.text))

export const countByStage = (checks: readonly Check[]): StageCounts => ({
  all: checks.length,
  commit: checks.filter((check) => check.stage === 'commit').length,
  ci: checks.filter((check) => check.stage === 'ci').length,
})

export const isStageFilter = (value: unknown): value is StageFilter =>
  value === 'all' || value === 'commit' || value === 'ci'
