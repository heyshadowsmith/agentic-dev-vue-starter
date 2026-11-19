import * as v from 'valibot'

const count = v.pipe(v.number(), v.integer(), v.minValue(0))

export const repositorySchema = v.pipe(
  v.object({
    full_name: v.string(),
    stargazers_count: count,
    forks_count: count,
    pushed_at: v.pipe(v.string(), v.isoTimestamp()),
  }),
  v.transform((data) => ({
    fullName: data.full_name,
    stars: data.stargazers_count,
    forks: data.forks_count,
    pushedAt: Date.parse(data.pushed_at),
  })),
)

export const searchCountSchema = v.pipe(
  v.object({ total_count: count }),
  v.transform((data) => data.total_count),
)
