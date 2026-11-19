import * as v from 'valibot'
import { failure, success, type Result } from '@/core/result'
import type { Repository } from '@/core/repository'
import type { RepositorySource } from '@/ports/repository-source'
import { repositorySchema } from './schema'

type Fetch = (input: string, init?: RequestInit) => Promise<Response>

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

const parseRepository = (body: unknown): Result<Repository> => {
  const parsed = v.safeParse(repositorySchema, body)
  if (parsed.success) return success(parsed.output)
  const issue = parsed.issues[0]
  const path = issue.path?.map((item) => String(item.key)).join('.') ?? 'response'
  return failure(`GitHub sent an unexpected response: ${path}: ${issue.message}`)
}

export const createGithubClient = ({
  fetch = (input, init) => globalThis.fetch(input, init),
  baseUrl = 'https://api.github.com',
  timeoutMs = 10_000,
}: GithubClientOptions = {}): RepositorySource => ({
  getRepository: async (fullName) => {
    try {
      const response = await fetch(`${baseUrl}/repos/${fullName}`, {
        headers: { accept: 'application/vnd.github+json' },
        signal: AbortSignal.timeout(timeoutMs),
      })
      return response.ok
        ? parseRepository(await readJson(response))
        : failure(`GitHub answered ${String(response.status)}.`)
    } catch {
      return failure('Could not reach GitHub.')
    }
  },
})
