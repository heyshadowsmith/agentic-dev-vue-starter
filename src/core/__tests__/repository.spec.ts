import { describe, expect, it } from 'vitest'
import { compactCount, repositoryActivity, timeSince, type Repository } from '../repository'

const now = 1_000_000_000_000
const minute = 60_000

describe('timeSince', () => {
  it.each([
    [0, 'just now'],
    [59_999, 'just now'],
    [minute, '1 minute ago'],
    [5 * minute, '5 minutes ago'],
    [60 * minute, '1 hour ago'],
    [26 * 60 * minute, '1 day ago'],
    [72 * 60 * minute, '3 days ago'],
  ])('describes %i ms as %s', (elapsed, text) => {
    expect(timeSince(now - elapsed, now)).toBe(text)
  })

  it('treats a time in the future as just now', () => {
    expect(timeSince(now + minute, now)).toBe('just now')
  })
})

describe('compactCount', () => {
  it.each([
    [0, '0'],
    [999, '999'],
    [1000, '1k'],
    [1234, '1.2k'],
    [15_999, '15.9k'],
  ])('shows %i as %s', (count, text) => {
    expect(compactCount(count)).toBe(text)
  })
})

describe('repositoryActivity', () => {
  const repository: Repository = {
    fullName: 'owner/name',
    stars: 12,
    forks: 3,
    openIssues: 1,
    pushedAt: now - 2 * 60 * minute,
  }

  it('lists the last push, the forks and the open issues', () => {
    expect(repositoryActivity(repository, now)).toStrictEqual([
      'Last push 2 hours ago',
      '3 forks',
      '1 open issue',
    ])
  })

  it('uses the singular for one fork and the plural for no issues', () => {
    expect(repositoryActivity({ ...repository, forks: 1, openIssues: 0 }, now)).toStrictEqual([
      'Last push 2 hours ago',
      '1 fork',
      '0 open issues',
    ])
  })
})
