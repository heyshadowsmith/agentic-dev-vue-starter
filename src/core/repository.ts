export interface Repository {
  readonly fullName: string
  readonly stars: number
  readonly forks: number
  readonly openIssues: number
  readonly pushedAt: number
}

export interface RepositoryStat {
  readonly label: string
  readonly value: string
}

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
  return `${String(count)} ${unit.name}${count === 1 ? '' : 's'} ago`
}

export const repositoryStats = (repository: Repository, now: number): readonly RepositoryStat[] => [
  { label: 'Stars', value: String(repository.stars) },
  { label: 'Forks', value: String(repository.forks) },
  { label: 'Open issues', value: String(repository.openIssues) },
  { label: 'Last push', value: timeSince(repository.pushedAt, now) },
]
