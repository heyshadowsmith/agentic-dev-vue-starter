import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Repository } from '@/core/repository'
import type { Result } from '@/core/result'
import { repositoryName } from '@/home/content'
import { useRepositorySource } from '@/ports/repository-source'

export const useRepositoryStore = defineStore('repository', () => {
  const source = useRepositorySource()
  const result = ref<Result<Repository>>()
  const checkedAt = ref(0)
  const pending = ref<Promise<void>>()

  const repository = computed(() => (result.value?.ok === true ? result.value.value : undefined))
  const error = computed(() => (result.value?.ok === false ? result.value.error : ''))

  const fetchRepository = async () => {
    const next = await source.getRepository(repositoryName)
    checkedAt.value = Date.now()
    result.value = next
  }

  const load = () => {
    result.value = undefined
    pending.value = fetchRepository()
    return pending.value
  }

  const ensureLoaded = () => pending.value ?? load()

  return { repository, error, checkedAt, load, ensureLoaded }
})
