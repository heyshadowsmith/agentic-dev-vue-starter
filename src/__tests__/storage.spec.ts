import { afterEach, describe, expect, it, vi } from 'vitest'
import { backupKey, loadPrompts, savePrompts, storageKey } from '@/lib/storage'
import { makePrompt } from './helpers'

const brokenStorage = (): Storage => ({
  length: 0,
  clear: vi.fn<() => void>(),
  key: () => null,
  removeItem: vi.fn<() => void>(),
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('full')
  },
})

afterEach(() => {
  localStorage.clear()
})

describe('loadPrompts', () => {
  it('starts empty when nothing is stored', () => {
    expect(loadPrompts(localStorage)).toStrictEqual([])
  })

  it('restores saved prompts', () => {
    const prompt = makePrompt({ id: 'a', tags: ['x'], useCount: 2, lastUsedAt: 5 })
    savePrompts(localStorage, [prompt])
    expect(loadPrompts(localStorage)).toStrictEqual([prompt])
  })

  it('starts empty and keeps a backup when the data is not JSON', () => {
    localStorage.setItem(storageKey, '{not json')
    expect(loadPrompts(localStorage)).toStrictEqual([])
    expect(localStorage.getItem(backupKey)).toBe('{not json')
  })

  it('starts empty when the data has the wrong shape', () => {
    localStorage.setItem(storageKey, '"hello"')
    expect(loadPrompts(localStorage)).toStrictEqual([])
    expect(localStorage.getItem(backupKey)).toBe('"hello"')
  })

  it('keeps the valid prompts when some are corrupt', () => {
    const prompt = makePrompt({ id: 'a' })
    const raw = JSON.stringify({ version: 1, prompts: [prompt, { id: 3 }] })
    localStorage.setItem(storageKey, raw)
    expect(loadPrompts(localStorage)).toStrictEqual([prompt])
    expect(localStorage.getItem(backupKey)).toBe(raw)
  })

  it('makes no backup when the data is good', () => {
    savePrompts(localStorage, [makePrompt({ id: 'a' })])
    loadPrompts(localStorage)
    expect(localStorage.getItem(backupKey)).toBeNull()
  })

  it('starts empty when the storage cannot be read', () => {
    expect(loadPrompts(brokenStorage())).toStrictEqual([])
  })
})

describe('savePrompts', () => {
  it('writes the library format', () => {
    const prompt = makePrompt({ id: 'a' })
    expect(savePrompts(localStorage, [prompt])).toBe(true)
    expect(JSON.parse(localStorage.getItem(storageKey) ?? '')).toStrictEqual({
      version: 1,
      prompts: [prompt],
    })
  })

  it('reports a failed write', () => {
    expect(savePrompts(brokenStorage(), [])).toBe(false)
  })
})
