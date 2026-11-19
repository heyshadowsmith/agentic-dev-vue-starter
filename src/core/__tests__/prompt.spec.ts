import { describe, expect, it } from 'vitest'
import { buildPrompt, isChangeKind, type PromptOptions } from '../prompt'

const none: PromptOptions = {
  task: 'Add a login form.',
  kind: 'feat',
  testsFirst: false,
  pureCore: false,
  askBeforeDependencies: false,
  openPullRequest: false,
}

describe('buildPrompt', () => {
  it('writes the base prompt with no options', () => {
    expect(buildPrompt(none)).toBe(
      [
        'Read AGENTS.md before you change any code.',
        '',
        'Build this feature: Add a login form.',
        '',
        'Use a "feat: ..." commit title with no scope, body or trailers.',
        'Run the checks before each commit and fix every error they report.',
      ].join('\n'),
    )
  })

  it('adds a line for each option in a fixed order', () => {
    const lines = buildPrompt({
      ...none,
      testsFirst: true,
      pureCore: true,
      askBeforeDependencies: true,
      openPullRequest: true,
    })
      .split('\n')
      .slice(6)
    expect(lines).toStrictEqual([
      'Write the failing tests first, then make them pass.',
      'Put pure logic in src/core and keep its coverage at 100%.',
      'Stop and ask me before you add a dependency.',
      'Open a pull request when every check passes.',
    ])
  })

  it('uses the verb and commit type of the change kind', () => {
    const prompt = buildPrompt({ ...none, kind: 'fix', task: 'The total is wrong.' })
    expect(prompt).toContain('Fix this bug: The total is wrong.')
    expect(prompt).toContain('Use a "fix: ..." commit title')
  })

  it('trims the task', () => {
    expect(buildPrompt({ ...none, kind: 'refactor', task: '  Split the store.  ' })).toContain(
      'Refactor this code: Split the store.\n',
    )
  })

  it('uses a placeholder for an empty task', () => {
    expect(buildPrompt({ ...none, task: ' '.repeat(3) })).toContain(
      'Build this feature: Describe the change here.',
    )
  })
})

describe('isChangeKind', () => {
  it.each(['feat', 'fix', 'refactor'])('accepts %s', (value) => {
    expect(isChangeKind(value)).toBe(true)
  })

  it.each(['chore', undefined])('rejects %s', (value) => {
    expect(isChangeKind(value)).toBe(false)
  })
})
