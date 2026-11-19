import { describe, expect, it } from 'vitest'
import {
  createPrompt,
  draftProblems,
  duplicatePrompt,
  formatTags,
  parseTags,
  recordUse,
  removePrompt,
  replacePrompt,
  setPinned,
  updatePrompt,
} from '../prompts'
import type { Prompt } from '../prompts'

const base: Prompt = {
  id: 'p1',
  title: 'Summary',
  body: 'Summarize {{text}}',
  tags: ['writing'],
  createdAt: 100,
  updatedAt: 100,
  pinned: false,
  useCount: 0,
  lastUsedAt: null,
}

describe('tags', () => {
  it('splits, trims, lowercases and removes duplicates and empty tags', () => {
    expect(parseTags(' Code, review ,, code,  ')).toStrictEqual(['code', 'review'])
  })

  it('returns no tags for empty text', () => {
    expect(parseTags('')).toStrictEqual([])
  })

  it('formats tags as comma-separated text', () => {
    expect(formatTags(['a', 'b'])).toBe('a, b')
  })
})

describe('draftProblems', () => {
  it('accepts a draft with a title and a body', () => {
    expect(draftProblems({ title: 'T', body: 'B', tags: [] })).toStrictEqual([])
  })

  it('reports a blank title and body', () => {
    expect(draftProblems({ title: '  ', body: '\n', tags: [] })).toStrictEqual([
      'Enter a title.',
      'Enter the prompt text.',
    ])
  })
})

describe('prompt changes', () => {
  it('creates a prompt with clean fields and no use', () => {
    expect(createPrompt({ title: ' Hi ', body: 'Body', tags: ['A', 'a'] }, 'id1', 5)).toStrictEqual(
      {
        id: 'id1',
        title: 'Hi',
        body: 'Body',
        tags: ['a'],
        createdAt: 5,
        updatedAt: 5,
        pinned: false,
        useCount: 0,
        lastUsedAt: null,
      },
    )
  })

  it('updates the content and the updated time only', () => {
    const used = { ...base, pinned: true, useCount: 3, lastUsedAt: 150 }
    expect(updatePrompt(used, { title: 'New', body: 'B2', tags: ['x'] }, 200)).toStrictEqual({
      ...used,
      title: 'New',
      body: 'B2',
      tags: ['x'],
      updatedAt: 200,
    })
  })

  it('duplicates a prompt with a new id, a copy title and fresh stats', () => {
    const used = { ...base, pinned: true, useCount: 3, lastUsedAt: 150 }
    expect(duplicatePrompt(used, 'p2', 300)).toStrictEqual({
      ...base,
      id: 'p2',
      title: 'Summary (copy)',
      createdAt: 300,
      updatedAt: 300,
    })
  })

  it('records a use', () => {
    expect(recordUse(recordUse(base, 10), 20)).toStrictEqual({
      ...base,
      useCount: 2,
      lastUsedAt: 20,
    })
  })

  it('pins and unpins', () => {
    expect(setPinned(setPinned(base, true), false)).toStrictEqual(base)
  })

  it('replaces a prompt by id', () => {
    const other = { ...base, id: 'p2' }
    const changed = { ...base, title: 'Changed' }
    expect(replacePrompt([base, other], changed)).toStrictEqual([changed, other])
  })

  it('removes a prompt by id', () => {
    const other = { ...base, id: 'p2' }
    expect(removePrompt([base, other], 'p1')).toStrictEqual([other])
  })
})
