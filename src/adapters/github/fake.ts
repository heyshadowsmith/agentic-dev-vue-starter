import type { Repository } from '@/core/repository'
import { success, type Result } from '@/core/result'
import type { RepositorySource } from '@/ports/repository-source'

const fakeRepository: Repository = {
  fullName: 'heyshadowsmith/agentic-dev-vue-starter',
  stars: 42,
  forks: 7,
  openIssues: 3,
  pushedAt: Date.UTC(2026, 10, 19, 12),
}

export const createFakeRepositorySource = (
  result: Result<Repository> = success(fakeRepository),
): RepositorySource & { readonly requests: readonly string[] } => {
  const requests: string[] = []
  return {
    requests,
    getRepository: (fullName) => {
      requests.push(fullName)
      return Promise.resolve(result)
    },
  }
}
