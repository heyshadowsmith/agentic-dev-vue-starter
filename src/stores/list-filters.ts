import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SortOrder } from '@/core/query'

export const useListFilters = defineStore('list-filters', () => {
  const text = ref('')
  const tags = ref<string[]>([])
  const sort = ref<SortOrder>('recent')

  const clear = () => {
    text.value = ''
    tags.value = []
  }

  return { text, tags, sort, clear }
})
