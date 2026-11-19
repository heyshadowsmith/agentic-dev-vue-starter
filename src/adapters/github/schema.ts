import * as v from 'valibot'

const count = v.pipe(v.number(), v.integer(), v.minValue(0))
const undocumented = "GitHub's OpenAPI spec gives no description."

export const repositorySchema = v.pipe(
  v.object({
    full_name: v.pipe(
      v.string(),
      v.description(`Owner and repository name, for example octocat/Hello-World. ${undocumented}`),
    ),
    stargazers_count: v.pipe(
      count,
      v.description(`The number of stars on the repository. ${undocumented}`),
    ),
    forks_count: v.pipe(count, v.description(`The number of forks. ${undocumented}`)),
    pushed_at: v.pipe(
      v.string(),
      v.isoTimestamp(),
      v.description(`The time of the latest push, as an ISO 8601 date-time. ${undocumented}`),
    ),
  }),
  v.transform((data) => ({
    fullName: data.full_name,
    stars: data.stargazers_count,
    forks: data.forks_count,
    pushedAt: Date.parse(data.pushed_at),
  })),
)

export const searchCountSchema = v.pipe(
  v.object({
    total_count: v.pipe(
      count,
      v.description(
        `The number of results for the whole query, not only this page. ${undocumented}`,
      ),
    ),
    incomplete_results: v.pipe(
      v.boolean(),
      v.description(
        'True when the search stopped before it found all results, so total_count can be too low.',
      ),
    ),
  }),
  v.check(
    (data) => !data.incomplete_results,
    'GitHub returned incomplete search results, so the count is not reliable.',
  ),
  v.transform((data) => data.total_count),
)
