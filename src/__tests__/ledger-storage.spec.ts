import { describe, expect, it } from 'vitest'
import { emptyLedger } from '../core/ledger'
import { readLedger, storageKey, writeLedger } from '../stores/ledger-storage'
import { sampleLedger } from './mount-app'

const storageWith = (value: string | null) => {
  const stored = new Map([[storageKey, value]])
  return { getItem: (key: string) => stored.get(key) ?? null }
}

const failingStorage = {
  getItem: (): string | null => {
    throw new Error('Access denied')
  },
  setItem: () => {
    throw new Error('Quota exceeded')
  },
}

describe('readLedger', () => {
  it('starts empty when nothing is stored', () => {
    expect(readLedger(storageWith(null))).toStrictEqual(emptyLedger)
  })

  it('restores a stored ledger', () => {
    const stored = JSON.stringify(sampleLedger)
    expect(readLedger(storageWith(stored))).toStrictEqual(sampleLedger)
  })

  it('starts empty when the stored text is not JSON', () => {
    expect(readLedger(storageWith('{"people": ['))).toStrictEqual(emptyLedger)
  })

  it('starts empty when the stored JSON has the wrong shape', () => {
    expect(readLedger(storageWith('{"people": 3}'))).toStrictEqual(emptyLedger)
  })

  it('starts empty when the storage cannot be read', () => {
    expect(readLedger(failingStorage)).toStrictEqual(emptyLedger)
  })
})

describe('writeLedger', () => {
  it('stores the ledger as JSON', () => {
    const saved = new Map<string, string>()
    const storage = { setItem: (key: string, value: string) => saved.set(key, value) }
    expect(writeLedger(storage, sampleLedger)).toBe(true)
    expect(JSON.parse(saved.get(storageKey) ?? '')).toStrictEqual(sampleLedger)
  })

  it('reports a failed write instead of crashing', () => {
    expect(writeLedger(failingStorage, sampleLedger)).toBe(false)
  })
})
