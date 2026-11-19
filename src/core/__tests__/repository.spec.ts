import { describe, expect, it } from 'vitest'
import { repositoryStats, timeSince, type Repository } from '../repository'

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

describe('repositoryStats', () => {
  it('lists the counts and the last push', () => {
    const repository: Repository = {
      fullName: 'owner/name',
      stars: 12,
      forks: 3,
      openIssues: 0,
      pushedAt: now - 2 * 60 * minute,
    }
    expect(repositoryStats(repository, now)).toStrictEqual([
      { label: 'Stars', value: '12' },
      { label: 'Forks', value: '3' },
      { label: 'Open issues', value: '0' },
      { label: 'Last push', value: '2 hours ago' },
    ])
  })
})
