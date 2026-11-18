import { describe, expect, it } from 'vitest'
import { decodeLedger } from '../decode'
import { emptyLedger, type Ledger } from '../ledger'

const valid: Ledger = {
  people: [
    { id: 'p1', name: 'Alex' },
    { id: 'p2', name: 'Sam' },
  ],
  expenses: [
    {
      id: 'e1',
      description: 'Taxi',
      amountCents: 1250,
      paidBy: 'p1',
      splitAmong: ['p1', 'p2'],
      createdAt: '2026-11-18T12:00:00.000Z',
    },
  ],
}

const firstExpense = valid.expenses[0]

describe('decodeLedger', () => {
  it('keeps valid data', () => {
    expect(decodeLedger(structuredClone(valid))).toStrictEqual(valid)
  })

  it('drops unknown fields', () => {
    const extra = {
      people: [{ id: 'p1', name: ' Alex ', age: 3 }],
      expenses: [],
      version: 9,
    }
    expect(decodeLedger(extra)).toStrictEqual({
      people: [{ id: 'p1', name: 'Alex' }],
      expenses: [],
    })
  })

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a number', 42],
    ['a string', 'ledger'],
    ['an array', []],
    ['an empty object', {}],
    ['people that is not a list', { people: {}, expenses: [] }],
    ['expenses that is not a list', { people: [], expenses: 'none' }],
    ['a person without a name', { people: [{ id: 'p1' }], expenses: [] }],
    ['a person with a blank name', { people: [{ id: 'p1', name: '  ' }], expenses: [] }],
    ['a person that is null', { people: [null], expenses: [] }],
    [
      'two people with one ID',
      {
        people: [
          { id: 'p1', name: 'A' },
          { id: 'p1', name: 'B' },
        ],
        expenses: [],
      },
    ],
    [
      'two people with one name',
      {
        people: [
          { id: 'p1', name: 'Alex' },
          { id: 'p2', name: 'alex' },
        ],
        expenses: [],
      },
    ],
    ['a fractional amount', { ...valid, expenses: [{ ...firstExpense, amountCents: 12.5 }] }],
    ['a zero amount', { ...valid, expenses: [{ ...firstExpense, amountCents: 0 }] }],
    ['an amount as text', { ...valid, expenses: [{ ...firstExpense, amountCents: '1250' }] }],
    ['an empty split', { ...valid, expenses: [{ ...firstExpense, splitAmong: [] }] }],
    ['a split with a number', { ...valid, expenses: [{ ...firstExpense, splitAmong: [1] }] }],
    ['a missing date', { ...valid, expenses: [{ ...firstExpense, createdAt: undefined }] }],
    ['an unknown payer', { ...valid, expenses: [{ ...firstExpense, paidBy: 'ghost' }] }],
    [
      'an unknown person in the split',
      { ...valid, expenses: [{ ...firstExpense, splitAmong: ['p1', 'ghost'] }] },
    ],
    [
      'a person twice in the split',
      { ...valid, expenses: [{ ...firstExpense, splitAmong: ['p1', 'p1'] }] },
    ],
    ['two expenses with one ID', { ...valid, expenses: [firstExpense, firstExpense] }],
  ])('starts empty for %s', (_, value) => {
    expect(decodeLedger(value)).toStrictEqual(emptyLedger)
  })
})
