import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useLedgerStore } from '../stores/ledger'
import { storageKey } from '../stores/ledger-storage'
import { sampleLedger, storedLedger, storeLedger } from './mount-app'

const freshStore = () => {
  setActivePinia(createPinia())
  return useLedgerStore()
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ledger store', () => {
  it('starts empty without stored data', () => {
    expect(freshStore().ledger).toStrictEqual({ people: [], expenses: [] })
  })

  it('starts empty with corrupt stored data', () => {
    localStorage.setItem(storageKey, 'not json')
    expect(freshStore().ledger).toStrictEqual({ people: [], expenses: [] })
  })

  it('restores stored data', () => {
    storeLedger(sampleLedger)
    expect(freshStore().ledger).toStrictEqual(sampleLedger)
  })

  it('saves people and restores them after a reload', async () => {
    const store = freshStore()
    expect(store.addPerson('Alex')).toBeUndefined()
    await nextTick()
    expect(freshStore().people.map((person) => person.name)).toStrictEqual(['Alex'])
  })

  it('returns the error for a duplicate name and keeps the ledger', () => {
    const store = freshStore()
    store.addPerson('Alex')
    expect(store.addPerson('ALEX')).toBe('ALEX is already in the group.')
    expect(store.people).toHaveLength(1)
  })

  it('gives each expense a unique ID and the time it was added', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-18T09:30:00.000Z'))
    storeLedger({ ...sampleLedger, expenses: [] })
    const store = freshStore()
    const expense = {
      description: 'Lunch',
      amount: '10',
      paidBy: 'p-alex',
      splitAmong: ['p-alex', 'p-sam'],
    }
    expect(store.addExpense(expense)).toBeUndefined()
    expect(store.addExpense(expense)).toBeUndefined()
    const [first, second] = store.expenses
    expect(first?.createdAt).toBe('2026-11-18T09:30:00.000Z')
    expect(first?.id).not.toBe(second?.id)
    await nextTick()
    expect(storedLedger()).toStrictEqual(store.ledger)
  })

  it('computes balances and payments', () => {
    storeLedger(sampleLedger)
    const store = freshStore()
    expect(store.balances).toStrictEqual([
      { personId: 'p-alex', cents: -1250 },
      { personId: 'p-sam', cents: 1250 },
    ])
    expect(store.payments).toStrictEqual([{ from: 'p-alex', to: 'p-sam', cents: 1250 }])
  })

  it('refuses to remove a person in an expense', () => {
    storeLedger(sampleLedger)
    const store = freshStore()
    expect(store.removePerson('p-alex')).toBe(
      'This person is part of an expense. Delete those expenses first.',
    )
    store.deleteExpense('e-taxi')
    expect(store.removePerson('p-alex')).toBeUndefined()
    expect(store.people.map((person) => person.name)).toStrictEqual(['Sam'])
  })

  it('names an unknown person', () => {
    expect(freshStore().nameOf('ghost')).toBe('Unknown')
  })
})
