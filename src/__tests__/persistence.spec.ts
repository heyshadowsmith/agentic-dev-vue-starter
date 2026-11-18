import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { emptyState, type SplitterState } from '../core/types'
import { loadState, saveState, storageKey } from '../stores/persistence'

const state: SplitterState = {
  people: [{ id: 'alex', name: 'Alex' }],
  expenses: [],
}

const blocked = () => {
  throw new DOMException('Blocked', 'SecurityError')
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('loadState', () => {
  it('starts empty when nothing is stored', () => {
    expect(loadState(localStorage)).toStrictEqual(emptyState)
  })

  it('reads what saveState wrote', () => {
    expect(saveState(localStorage, state)).toBe(true)
    expect(loadState(localStorage)).toStrictEqual(state)
  })

  it('starts empty when the stored text is not JSON', () => {
    localStorage.setItem(storageKey, '{')
    expect(loadState(localStorage)).toStrictEqual(emptyState)
  })

  it('starts empty when the stored JSON is not a group', () => {
    localStorage.setItem(storageKey, '[1, 2, 3]')
    expect(loadState(localStorage)).toStrictEqual(emptyState)
  })

  it('starts empty when the browser blocks storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked)
    expect(loadState(localStorage)).toStrictEqual(emptyState)
  })
})

describe('saveState', () => {
  it('stores the state with a version', () => {
    saveState(localStorage, state)
    expect(JSON.parse(localStorage.getItem(storageKey) ?? '')).toStrictEqual({
      version: 1,
      ...state,
    })
  })

  it('reports a failure when the storage is full', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked)
    expect(saveState(localStorage, state)).toBe(false)
  })
})
