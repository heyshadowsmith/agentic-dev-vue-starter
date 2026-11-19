import * as v from 'valibot'
import type { Repository } from '@/core/repository'

export const repositorySchema = v.pipe(
  v.object({
    full_name: v.string(),
    stargazers_count: v.pipe(v.number(), v.integer(), v.minValue(0)),
    forks_count: v.pipe(v.number(), v.integer(), v.minValue(0)),
    open_issues_count: v.pipe(v.number(), v.integer(), v.minValue(0)),
    pushed_at: v.pipe(v.string(), v.isoTimestamp()),
  }),
  v.transform((data): Repository => ({
    fullName: data.full_name,
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    pushedAt: Date.parse(data.pushed_at),
  })),
)
