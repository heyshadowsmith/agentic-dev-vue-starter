import { decodeState, encodeState } from '@/core/storage'
import { emptyState, type SplitterState } from '@/core/types'

export const storageKey = 'expense-splitter'

const readText = (storage: Storage): string | null => {
  try {
    return storage.getItem(storageKey)
  } catch {
    return null
  }
}

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

export const loadState = (storage: Storage): SplitterState => {
  const text = readText(storage)
  if (text === null) return emptyState
  const result = decodeState(parseJson(text))
  return result.ok ? result.value : emptyState
}

export const saveState = (storage: Storage, state: SplitterState): boolean => {
  try {
    storage.setItem(storageKey, JSON.stringify(encodeState(state)))
    return true
  } catch {
    return false
  }
}
