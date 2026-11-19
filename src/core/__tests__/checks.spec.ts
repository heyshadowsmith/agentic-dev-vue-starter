import { describe, expect, it } from 'vitest'
import { countByStage, filterChecks, isStageFilter, type Check } from '../checks'

const lint: Check = {
  id: 'lint',
  tool: 'ESLint',
  stage: 'commit',
  catches: 'Comments in code',
  example: 'local/no-comments',
}
const knip: Check = {
  id: 'knip',
  tool: 'Knip',
  stage: 'ci',
  catches: 'Unused files',
  example: 'Unused files (1)',
}
const checks = [lint, knip]

describe('filterChecks', () => {
  it('returns every check for an empty query', () => {
    expect(filterChecks(checks, { text: '', stage: 'all' })).toStrictEqual(checks)
  })

  it('keeps the checks of one stage', () => {
    expect(filterChecks(checks, { text: '', stage: 'ci' })).toStrictEqual([knip])
  })

  it('matches each word of the text in any field, ignoring case', () => {
    expect(filterChecks(checks, { text: '  UNUSED   files ', stage: 'all' })).toStrictEqual([knip])
  })

  it('matches the example output', () => {
    expect(filterChecks(checks, { text: 'no-comments', stage: 'all' })).toStrictEqual([lint])
  })

  it('needs both the stage and the text to match', () => {
    expect(filterChecks(checks, { text: 'unused', stage: 'commit' })).toStrictEqual([])
  })
})

describe('countByStage', () => {
  it('counts all checks and each stage', () => {
    expect(countByStage(checks)).toStrictEqual({ all: 2, commit: 1, ci: 1 })
  })
})

describe('isStageFilter', () => {
  it.each(['all', 'commit', 'ci'])('accepts %s', (value) => {
    expect(isStageFilter(value)).toBe(true)
  })

  it.each(['push', null, 1])('rejects %s', (value) => {
    expect(isStageFilter(value)).toBe(false)
  })
})
