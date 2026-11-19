import { describe, expect, it } from 'vitest'
import type { Prompt } from '../prompts'
import {
  collectTags,
  isSortOrder,
  matchesSearch,
  matchesTags,
  queryPrompts,
  sortPrompts,
} from '../query'

const prompt = (overrides: Partial<Prompt> & { id: string }): Prompt => ({
  title: overrides.id,
  body: '',
  tags: [],
  createdAt: 0,
  updatedAt: 0,
  pinned: false,
  useCount: 0,
  lastUsedAt: null,
  ...overrides,
})

const ids = (prompts: readonly Prompt[]) => prompts.map((item) => item.id)

describe('matchesSearch', () => {
  const item = prompt({
    id: 'a',
    title: 'Code Review',
    body: 'Check the {{diff}}',
    tags: ['dev'],
  })

  it('matches the title without regard to case', () => {
    expect(matchesSearch(item, 'REVIEW')).toBe(true)
  })

  it('matches the body', () => {
    expect(matchesSearch(item, 'diff')).toBe(true)
  })

  it('matches a tag', () => {
    expect(matchesSearch(item, 'dev')).toBe(true)
  })

  it('needs every word to match somewhere', () => {
    expect(matchesSearch(item, 'code dev')).toBe(true)
  })

  it('fails when one word does not match', () => {
    expect(matchesSearch(item, 'code poem')).toBe(false)
  })

  it('matches everything for blank text', () => {
    expect(matchesSearch(item, ' '.repeat(3))).toBe(true)
  })
})

describe('matchesTags', () => {
  const item = prompt({ id: 'a', tags: ['dev', 'review'] })

  it('matches when no tags are selected', () => {
    expect(matchesTags(item, [])).toBe(true)
  })

  it('matches when the prompt has every selected tag', () => {
    expect(matchesTags(item, ['dev', 'review'])).toBe(true)
  })

  it('fails when the prompt lacks a selected tag', () => {
    expect(matchesTags(item, ['dev', 'writing'])).toBe(false)
  })
})

describe('sortPrompts', () => {
  const never = prompt({ id: 'never', title: 'Beta', updatedAt: 50 })
  const neverOlder = prompt({ id: 'never-older', title: 'Alpha', updatedAt: 10 })
  const old = prompt({ id: 'old', title: 'Gamma', useCount: 5, lastUsedAt: 100 })
  const recent = prompt({ id: 'recent', title: 'delta', useCount: 1, lastUsedAt: 200 })
  const all = [never, neverOlder, old, recent]

  it('sorts by most recent use, then by most recent update', () => {
    expect(ids(sortPrompts(all, 'recent'))).toStrictEqual(['recent', 'old', 'never', 'never-older'])
  })

  it('sorts by use count, then by recent use', () => {
    expect(ids(sortPrompts(all, 'most-used'))).toStrictEqual([
      'old',
      'recent',
      'never',
      'never-older',
    ])
  })

  it('sorts by title without regard to case', () => {
    expect(ids(sortPrompts(all, 'title'))).toStrictEqual(['never-older', 'never', 'recent', 'old'])
  })

  it('breaks title ties by id', () => {
    const second = prompt({ id: 'b', title: 'Same' })
    const first = prompt({ id: 'a', title: 'same' })
    expect(ids(sortPrompts([second, first], 'title'))).toStrictEqual(['a', 'b'])
  })

  it('breaks recent ties by title', () => {
    const second = prompt({ id: 'b', title: 'Zed' })
    const first = prompt({ id: 'a', title: 'Ann' })
    expect(ids(sortPrompts([second, first], 'recent'))).toStrictEqual(['a', 'b'])
  })

  it('puts pinned prompts first in every order', () => {
    const pinned = prompt({ id: 'pinned', title: 'Zulu', pinned: true })
    expect(ids(sortPrompts([...all, pinned], 'title'))[0]).toBe('pinned')
  })

  it('sorts pinned prompts among themselves', () => {
    const pinnedB = prompt({ id: 'pb', title: 'B', pinned: true, useCount: 1 })
    const pinnedA = prompt({ id: 'pa', title: 'A', pinned: true, useCount: 9 })
    expect(ids(sortPrompts([old, pinnedB, pinnedA], 'most-used'))).toStrictEqual([
      'pa',
      'pb',
      'old',
    ])
  })

  it('does not change the input list', () => {
    const input = [never, recent]
    sortPrompts(input, 'recent')
    expect(ids(input)).toStrictEqual(['never', 'recent'])
  })
})

describe('queryPrompts', () => {
  const a = prompt({ id: 'a', title: 'Email reply', tags: ['work', 'email'], useCount: 1 })
  const b = prompt({ id: 'b', title: 'Email draft', tags: ['email'], useCount: 3 })
  const c = prompt({ id: 'c', title: 'Poem', tags: ['fun'], pinned: true })

  it('combines search, tag filter and sort', () => {
    expect(
      ids(queryPrompts([a, b, c], { text: 'email', tags: ['email'], sort: 'most-used' })),
    ).toStrictEqual(['b', 'a'])
  })

  it('filters by several tags', () => {
    expect(
      ids(queryPrompts([a, b, c], { text: '', tags: ['email', 'work'], sort: 'title' })),
    ).toStrictEqual(['a'])
  })

  it('keeps pinned prompts first when they match', () => {
    expect(ids(queryPrompts([a, b, c], { text: '', tags: [], sort: 'title' }))).toStrictEqual([
      'c',
      'b',
      'a',
    ])
  })
})

describe('collectTags', () => {
  it('lists each tag once, in order', () => {
    expect(
      collectTags([prompt({ id: 'a', tags: ['b', 'a'] }), prompt({ id: 'b', tags: ['a', 'c'] })]),
    ).toStrictEqual(['a', 'b', 'c'])
  })
})

describe('isSortOrder', () => {
  it.each(['recent', 'most-used', 'title'])('accepts %s', (value) => {
    expect(isSortOrder(value)).toBe(true)
  })

  it('rejects other values', () => {
    expect(isSortOrder('newest')).toBe(false)
  })
})
