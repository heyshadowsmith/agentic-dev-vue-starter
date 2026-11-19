export interface Prompt {
  readonly id: string
  readonly title: string
  readonly body: string
  readonly tags: readonly string[]
  readonly createdAt: number
  readonly updatedAt: number
  readonly pinned: boolean
  readonly useCount: number
  readonly lastUsedAt: number | null
}

export interface PromptDraft {
  readonly title: string
  readonly body: string
  readonly tags: readonly string[]
}

const unique = (items: readonly string[]): readonly string[] =>
  items.filter((item, index) => items.indexOf(item) === index)

export const normalizeTags = (tags: readonly string[]): readonly string[] =>
  unique(tags.map((tag) => tag.trim().toLowerCase()).filter((tag) => tag !== ''))

export const parseTags = (text: string): readonly string[] => normalizeTags(text.split(','))

export const formatTags = (tags: readonly string[]): string => tags.join(', ')

export const draftProblems = (draft: PromptDraft): readonly string[] =>
  [
    draft.title.trim() === '' ? 'Enter a title.' : '',
    draft.body.trim() === '' ? 'Enter the prompt text.' : '',
  ].filter((problem) => problem !== '')

export const createPrompt = (draft: PromptDraft, id: string, now: number): Prompt => ({
  id,
  title: draft.title.trim(),
  body: draft.body,
  tags: normalizeTags(draft.tags),
  createdAt: now,
  updatedAt: now,
  pinned: false,
  useCount: 0,
  lastUsedAt: null,
})

export const updatePrompt = (prompt: Prompt, draft: PromptDraft, now: number): Prompt => ({
  ...prompt,
  title: draft.title.trim(),
  body: draft.body,
  tags: normalizeTags(draft.tags),
  updatedAt: now,
})

export const duplicatePrompt = (prompt: Prompt, id: string, now: number): Prompt =>
  createPrompt({ ...prompt, title: `${prompt.title} (copy)` }, id, now)

export const recordUse = (prompt: Prompt, now: number): Prompt => ({
  ...prompt,
  useCount: prompt.useCount + 1,
  lastUsedAt: now,
})

export const setPinned = (prompt: Prompt, pinned: boolean): Prompt => ({ ...prompt, pinned })

export const replacePrompt = (prompts: readonly Prompt[], next: Prompt): readonly Prompt[] =>
  prompts.map((prompt) => (prompt.id === next.id ? next : prompt))

export const removePrompt = (prompts: readonly Prompt[], id: string): readonly Prompt[] =>
  prompts.filter((prompt) => prompt.id !== id)
