import type { Prompt } from './prompts'

export type SortOrder = 'recent' | 'most-used' | 'title'

export interface PromptQuery {
  readonly text: string
  readonly tags: readonly string[]
  readonly sort: SortOrder
}

type Compare = (a: Prompt, b: Prompt) => number

const searchTerms = (text: string): readonly string[] =>
  text
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term !== '')

export const matchesSearch = (prompt: Prompt, text: string): boolean => {
  const haystack = [prompt.title, prompt.body, ...prompt.tags].join('\n').toLowerCase()
  return searchTerms(text).every((term) => haystack.includes(term))
}

export const matchesTags = (prompt: Prompt, tags: readonly string[]): boolean =>
  tags.every((tag) => prompt.tags.includes(tag))

const byTitle: Compare = (a, b) =>
  a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }) || a.id.localeCompare(b.id)

const byRecentUse: Compare = (a, b) =>
  (b.lastUsedAt ?? -1) - (a.lastUsedAt ?? -1) || b.updatedAt - a.updatedAt || byTitle(a, b)

const byUseCount: Compare = (a, b) => b.useCount - a.useCount || byRecentUse(a, b)

const byPinned: Compare = (a, b) => Number(b.pinned) - Number(a.pinned)

const comparators: Readonly<Record<SortOrder, Compare>> = {
  recent: byRecentUse,
  'most-used': byUseCount,
  title: byTitle,
}

export const sortPrompts = (prompts: readonly Prompt[], sort: SortOrder): readonly Prompt[] =>
  [...prompts].sort((a, b) => byPinned(a, b) || comparators[sort](a, b))

export const queryPrompts = (prompts: readonly Prompt[], query: PromptQuery): readonly Prompt[] =>
  sortPrompts(
    prompts.filter(
      (prompt) => matchesSearch(prompt, query.text) && matchesTags(prompt, query.tags),
    ),
    query.sort,
  )

export const collectTags = (prompts: readonly Prompt[]): readonly string[] =>
  [...new Set(prompts.flatMap((prompt) => prompt.tags))].sort((a, b) => a.localeCompare(b))

export const isSortOrder = (value: unknown): value is SortOrder =>
  value === 'recent' || value === 'most-used' || value === 'title'
