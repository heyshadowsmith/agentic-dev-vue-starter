export interface Repository {
  readonly fullName: string
  readonly stars: number
  readonly forks: number
  readonly openIssues: number
  readonly openPullRequests: number
  readonly pushedAt: number
}

const plural = (count: number, noun: string): string =>
  `${String(count)} ${noun}${count === 1 ? '' : 's'}`

const units = [
  { name: 'day', milliseconds: 86_400_000 },
  { name: 'hour', milliseconds: 3_600_000 },
  { name: 'minute', milliseconds: 60_000 },
] as const

export const timeSince = (then: number, now: number): string => {
  const elapsed = Math.max(0, now - then)
  const unit = units.find((candidate) => elapsed >= candidate.milliseconds)
  if (unit === undefined) return 'just now'
  const count = Math.floor(elapsed / unit.milliseconds)
  return `${plural(count, unit.name)} ago`
}

export const compactCount = (count: number): string =>
  count < 1000 ? String(count) : `${(Math.floor(count / 100) / 10).toFixed(1).replace(/\.0$/, '')}k`

export const repositoryActivity = (repository: Repository, now: number): readonly string[] => [
  `Last push ${timeSince(repository.pushedAt, now)}`,
  plural(repository.forks, 'fork'),
  plural(repository.openPullRequests, 'open pull request'),
  plural(repository.openIssues, 'open issue'),
]
