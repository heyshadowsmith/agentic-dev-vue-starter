import { describe, expect, it } from 'vitest'
import {
  addExpense,
  addPerson,
  deleteExpense,
  emptyLedger,
  isInvolved,
  removePerson,
  type ExpenseDraft,
  type Ledger,
} from '../ledger'

const group: Ledger = {
  people: [
    { id: 'p1', name: 'Alex' },
    { id: 'p2', name: 'Sam' },
    { id: 'p3', name: 'Kim' },
  ],
  expenses: [],
}

const draft: ExpenseDraft = {
  id: 'e1',
  createdAt: '2026-11-18T12:00:00.000Z',
  description: ' Dinner ',
  amount: '30.00',
  paidBy: 'p1',
  splitAmong: ['p3', 'p1'],
}

const withDinner: Ledger = {
  ...group,
  expenses: [
    {
      id: 'e1',
      createdAt: '2026-11-18T12:00:00.000Z',
      description: 'Dinner',
      amountCents: 3000,
      paidBy: 'p1',
      splitAmong: ['p1', 'p3'],
    },
  ],
}

describe('addPerson', () => {
  it('adds a person with a trimmed name', () => {
    expect(addPerson(emptyLedger, { id: 'p1', name: '  Alex ' })).toStrictEqual({
      ok: true,
      value: { people: [{ id: 'p1', name: 'Alex' }], expenses: [] },
    })
  })

  it('rejects an empty name', () => {
    expect(addPerson(group, { id: 'p9', name: ' '.repeat(3) })).toStrictEqual({
      ok: false,
      error: 'Enter a name.',
    })
  })

  it('rejects a name that differs only in case', () => {
    expect(addPerson(group, { id: 'p9', name: 'aLEX' })).toStrictEqual({
      ok: false,
      error: 'aLEX is already in the group.',
    })
  })

  it('rejects an ID that is in use', () => {
    expect(addPerson(group, { id: 'p1', name: 'Jo' })).toStrictEqual({
      ok: false,
      error: 'That person ID is already in use.',
    })
  })
})

describe('removePerson', () => {
  it('removes a person who is in no expense', () => {
    expect(removePerson(withDinner, 'p2')).toStrictEqual({
      ok: true,
      value: { ...withDinner, people: [group.people[0], group.people[2]] },
    })
  })

  it('refuses to remove the payer of an expense', () => {
    expect(removePerson(withDinner, 'p1')).toStrictEqual({
      ok: false,
      error: 'This person is part of an expense. Delete those expenses first.',
    })
  })

  it('refuses to remove a person who shares an expense', () => {
    expect(removePerson(withDinner, 'p3').ok).toBe(false)
  })

  it('refuses an unknown person', () => {
    expect(removePerson(group, 'nobody')).toStrictEqual({
      ok: false,
      error: 'That person is not in the group.',
    })
  })
})

describe('isInvolved', () => {
  it.each([
    ['p1', true],
    ['p2', false],
    ['p3', true],
  ])('says whether %s is in an expense', (personId, involved) => {
    expect(isInvolved(withDinner, personId)).toBe(involved)
  })
})

describe('addExpense', () => {
  it('adds an expense in cents, with people in group order', () => {
    expect(addExpense(group, draft)).toStrictEqual({ ok: true, value: withDinner })
  })

  it('removes duplicate people from the split', () => {
    const result = addExpense(group, { ...draft, splitAmong: ['p2', 'p2'] })
    expect(result.ok && result.value.expenses[0]?.splitAmong).toStrictEqual(['p2'])
  })

  it.each<[string, Partial<ExpenseDraft>, string]>([
    ['an empty description', { description: '  ' }, 'Enter a description.'],
    ['a bad amount', { amount: '12.345' }, 'Enter an amount greater than zero, for example 12.50.'],
    ['a zero amount', { amount: '0' }, 'Enter an amount greater than zero, for example 12.50.'],
    ['no payer', { paidBy: null }, 'Choose who paid.'],
    ['an unknown payer', { paidBy: 'ghost' }, 'Choose who paid.'],
    [
      'nobody to split with',
      { splitAmong: [] },
      'Choose at least one person to split the expense with.',
    ],
    [
      'an unknown person in the split',
      { splitAmong: ['p1', 'ghost'] },
      'Choose at least one person to split the expense with.',
    ],
  ])('rejects %s', (_, change, error) => {
    expect(addExpense(group, { ...draft, ...change })).toStrictEqual({ ok: false, error })
  })

  it('rejects an expense ID that is in use', () => {
    expect(addExpense(withDinner, draft)).toStrictEqual({
      ok: false,
      error: 'That expense ID is already in use.',
    })
  })
})

describe('deleteExpense', () => {
  it('deletes the expense with the ID', () => {
    expect(deleteExpense(withDinner, 'e1')).toStrictEqual(group)
  })

  it('keeps the ledger when the ID is unknown', () => {
    expect(deleteExpense(withDinner, 'nope')).toStrictEqual(withDinner)
  })
})
