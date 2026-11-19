import { defineStore } from 'pinia'
import { shallowRef } from 'vue'
import { toast } from '@ui-sdk/vue/toast'
import {
  createPrompt,
  duplicatePrompt,
  recordUse,
  removePrompt,
  replacePrompt,
  setPinned,
  updatePrompt,
} from '@/core/prompts'
import type { Prompt, PromptDraft } from '@/core/prompts'
import { newId } from '@/lib/browser'
import { loadPrompts, savePrompts, storageKey } from '@/lib/storage'

export const usePromptStore = defineStore('prompts', () => {
  const prompts = shallowRef<readonly Prompt[]>(loadPrompts(localStorage))

  const commit = (next: readonly Prompt[]) => {
    prompts.value = next
    if (savePrompts(localStorage, next)) return
    toast.error('Could not save your prompts', {
      description: 'The browser storage is full or blocked. Export your prompts to keep a copy.',
    })
  }

  const findPrompt = (id: string): Prompt | undefined =>
    prompts.value.find((prompt) => prompt.id === id)

  const change = (id: string, update: (prompt: Prompt) => Prompt): Prompt | undefined => {
    const prompt = findPrompt(id)
    if (prompt === undefined) return undefined
    const next = update(prompt)
    commit(replacePrompt(prompts.value, next))
    return next
  }

  const add = (prompt: Prompt): Prompt => {
    commit([...prompts.value, prompt])
    return prompt
  }

  const addPrompt = (draft: PromptDraft) => add(createPrompt(draft, newId(), Date.now()))

  const editPrompt = (id: string, draft: PromptDraft) =>
    change(id, (prompt) => updatePrompt(prompt, draft, Date.now()))

  const duplicate = (id: string): Prompt | undefined => {
    const prompt = findPrompt(id)
    return prompt && add(duplicatePrompt(prompt, newId(), Date.now()))
  }

  const deletePrompt = (id: string) => {
    commit(removePrompt(prompts.value, id))
  }

  const togglePinned = (id: string) => change(id, (prompt) => setPinned(prompt, !prompt.pinned))

  const markUsed = (id: string) => change(id, (prompt) => recordUse(prompt, Date.now()))

  const importPrompts = (incoming: readonly Prompt[]) => {
    commit([...prompts.value, ...incoming])
  }

  addEventListener('storage', (event) => {
    if (event.key === storageKey) prompts.value = loadPrompts(localStorage)
  })

  return {
    prompts,
    findPrompt,
    addPrompt,
    editPrompt,
    duplicate,
    deletePrompt,
    togglePinned,
    markUsed,
    importPrompts,
  }
})
