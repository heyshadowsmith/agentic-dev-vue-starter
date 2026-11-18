import { describe, expect, it } from 'vitest'
import { computeBalances } from '../balances'
import type { Expense, Ledger } from '../ledger'
import { sum } from '../sum'

const people = [
  { id: 'a', name: 'Alex' },
  { id: 'b', name: 'Sam' },
  { id: 'c', name: 'Kim' },
]

const expense = (fields: Partial<Expense>): Expense => ({
  id: 'e',
  description: 'Thing',
  amountCents: 0,
  paidBy: 'a',
  splitAmong: ['a', 'b', 'c'],
  createdAt: '2026-11-18T00:00:00.000Z',
  ...fields,
})

describe('computeBalances', () => {
  it('gives everyone zero with no expenses', () => {
    expect(computeBalances({ people, expenses: [] })).toStrictEqual([
      { personId: 'a', cents: 0 },
      { personId: 'b', cents: 0 },
      { personId: 'c', cents: 0 },
    ])
  })

  it('credits the payer and charges each share', () => {
    const ledger: Ledger = { people, expenses: [expense({ amountCents: 900 })] }
    expect(computeBalances(ledger)).toStrictEqual([
      { personId: 'a', cents: 600 },
      { personId: 'b', cents: -300 },
      { personId: 'c', cents: -300 },
    ])
  })

  it('charges the leftover cent of an uneven split to the first person', () => {
    const ledger: Ledger = { people, expenses: [expense({ amountCents: 1000, paidBy: 'c' })] }
    expect(computeBalances(ledger)).toStrictEqual([
      { personId: 'a', cents: -334 },
      { personId: 'b', cents: -333 },
      { personId: 'c', cents: 667 },
    ])
  })

  it('gives a payer outside the split the full amount', () => {
    const ledger: Ledger = {
      people,
      expenses: [expense({ amountCents: 500, paidBy: 'c', splitAmong: ['a', 'b'] })],
    }
    expect(computeBalances(ledger)).toStrictEqual([
      { personId: 'a', cents: -250 },
      { personId: 'b', cents: -250 },
      { personId: 'c', cents: 500 },
    ])
  })

  it('gives zero to a person who pays only for themselves', () => {
    const ledger: Ledger = {
      people,
      expenses: [expense({ amountCents: 777, paidBy: 'b', splitAmong: ['b'] })],
    }
    expect(computeBalances(ledger).map((balance) => balance.cents)).toStrictEqual([0, 0, 0])
  })

  it('adds up several expenses and always totals zero', () => {
    const ledger: Ledger = {
      people,
      expenses: [
        expense({ id: '1', amountCents: 1001, paidBy: 'a' }),
        expense({ id: '2', amountCents: 2, paidBy: 'b', splitAmong: ['a', 'c'] }),
        expense({ id: '3', amountCents: 3333, paidBy: 'c', splitAmong: ['a', 'b'] }),
      ],
    }
    const balances = computeBalances(ledger)
    expect(balances).toStrictEqual([
      { personId: 'a', cents: 1001 - 334 - 1 - 1667 },
      { personId: 'b', cents: -334 + 2 - 1666 },
      { personId: 'c', cents: -333 - 1 + 3333 },
    ])
    expect(sum(balances.map((balance) => balance.cents))).toBe(0)
  })
})
