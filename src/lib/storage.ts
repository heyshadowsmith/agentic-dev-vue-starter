import { encodeLibrary, restoreLibrary } from '@/core/library'
import type { Prompt } from '@/core/prompts'
import { parseJson } from './json'

export const storageKey = 'prompt-library'
export const backupKey = 'prompt-library-backup'

const readItem = (storage: Storage, key: string): string | null => {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

const writeItem = (storage: Storage, key: string, value: string): boolean => {
  try {
    storage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export const loadPrompts = (storage: Storage): readonly Prompt[] => {
  const raw = readItem(storage, storageKey)
  if (raw === null) return []
  const parsed = parseJson(raw)
  const restored = parsed.ok ? restoreLibrary(parsed.value) : { prompts: [], damaged: true }
  if (restored.damaged) writeItem(storage, backupKey, raw)
  return restored.prompts
}

export const savePrompts = (storage: Storage, prompts: readonly Prompt[]): boolean =>
  writeItem(storage, storageKey, JSON.stringify(encodeLibrary(prompts)))
