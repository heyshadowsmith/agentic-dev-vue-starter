import type { App } from 'vue'
import type { Repository } from '@/core/repository'
import type { Result } from '@/core/result'
import { createFakeRepositorySource } from '@/adapters/github/fake'
import { repositorySourceKey } from '@/ports/repository-source'

export const withFakes = (repository?: Result<Repository>) => {
  const source = createFakeRepositorySource(repository)
  return {
    source,
    plugin: {
      install: (app: App) => {
        app.provide(repositorySourceKey, source)
      },
    },
  }
}
