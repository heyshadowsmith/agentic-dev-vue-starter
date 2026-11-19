import { inject, type InjectionKey } from 'vue'
import type { Repository } from '@/core/repository'
import type { Result } from '@/core/result'

export interface RepositorySource {
  readonly getRepository: (fullName: string) => Promise<Result<Repository>>
}

export const repositorySourceKey: InjectionKey<RepositorySource> = Symbol('repository source')

export const useRepositorySource = (): RepositorySource => {
  const source = inject(repositorySourceKey)
  if (source === undefined) {
    throw new Error('No repository source. Provide one with repositorySourceKey in main.ts.')
  }
  return source
}
