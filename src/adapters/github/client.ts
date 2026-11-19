import * as v from 'valibot'
import { failure, success, type Result } from '@/core/result'
import type { RepositorySource } from '@/ports/repository-source'
import { repositorySchema, searchCountSchema } from './schema'

type Fetch = (input: string, init?: RequestInit) => Promise<Response>

type Schema<T> = v.GenericSchema<unknown, T>

interface GithubClientOptions {
  readonly fetch?: Fetch
  readonly baseUrl?: string
  readonly timeoutMs?: number
}

const readJson = async (response: Response): Promise<unknown> => {
  try {
    return (await response.json()) as unknown
  } catch {
    return undefined
  }
}

const parseWith = <T>(schema: Schema<T>, body: unknown): Result<T> => {
  const parsed = v.safeParse(schema, body)
  if (parsed.success) return success(parsed.output)
  const issue = parsed.issues[0]
  const path = issue.path?.map((item) => String(item.key)).join('.') ?? 'response'
  return failure(`GitHub sent an unexpected response: ${path}: ${issue.message}`)
}

const searchPath = (fullName: string, type: 'issue' | 'pr') => {
  const query = new URLSearchParams({
    per_page: '1',
    q: `repo:${fullName} type:${type} state:open`,
  })
  return `/search/issues?${query.toString()}`
}

export const createGithubClient = ({
  fetch = (input, init) => globalThis.fetch(input, init),
  baseUrl = 'https://api.github.com',
  timeoutMs = 10_000,
}: GithubClientOptions = {}): RepositorySource => {
  const getJson = async <T>(path: string, schema: Schema<T>): Promise<Result<T>> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: { accept: 'application/vnd.github+json' },
        signal: AbortSignal.timeout(timeoutMs),
      })
      return response.ok
        ? parseWith(schema, await readJson(response))
        : failure(`GitHub answered ${String(response.status)}.`)
    } catch {
      return failure('Could not reach GitHub.')
    }
  }

  return {
    getRepository: async (fullName) => {
      const [repository, issues, pullRequests] = await Promise.all([
        getJson(`/repos/${fullName}`, repositorySchema),
        getJson(searchPath(fullName, 'issue'), searchCountSchema),
        getJson(searchPath(fullName, 'pr'), searchCountSchema),
      ])
      if (!repository.ok) return repository
      if (!issues.ok) return issues
      if (!pullRequests.ok) return pullRequests
      return success({
        ...repository.value,
        openIssues: issues.value,
        openPullRequests: pullRequests.value,
      })
    },
  }
}
