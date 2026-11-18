import { describe, expect, it } from 'vitest'
import { computeBalances } from '../balances'
import type { Expense, Person } from '../types'

const people: Person[] = [
  { id: 'alex', name: 'Alex' },
  { id: 'sam', name: 'Sam' },
  { id: 'kim', name: 'Kim' },
]

const expense = (overrides: Partial<Expense>): Expense => ({
  id: 'e1',
  description: 'Dinner',
  amountCents: 3000,
  payerId: 'alex',
  participantIds: ['alex', 'sam', 'kim'],
  createdAt: '2026-11-18T12:00:00.000Z',
  ...overrides,
})

describe('computeBalances', () => {
  it('gives everyone a zero balance without expenses', () => {
    expect(computeBalances(people, [])).toStrictEqual([
      { personId: 'alex', balanceCents: 0 },
      { personId: 'sam', balanceCents: 0 },
      { personId: 'kim', balanceCents: 0 },
    ])
  })

  it('credits the payer and debits each participant', () => {
    expect(computeBalances(people, [expense({})])).toStrictEqual([
      { personId: 'alex', balanceCents: 2000 },
      { personId: 'sam', balanceCents: -1000 },
      { personId: 'kim', balanceCents: -1000 },
    ])
  })

  it('handles a payer who is not part of the split', () => {
    expect(computeBalances(people, [expense({ participantIds: ['sam', 'kim'] })])).toStrictEqual([
      { personId: 'alex', balanceCents: 3000 },
      { personId: 'sam', balanceCents: -1500 },
      { personId: 'kim', balanceCents: -1500 },
    ])
  })

  it('charges the leftover cent of an uneven split to the first participant', () => {
    expect(computeBalances(people, [expense({ amountCents: 1000 })])).toStrictEqual([
      { personId: 'alex', balanceCents: 666 },
      { personId: 'sam', balanceCents: -333 },
      { personId: 'kim', balanceCents: -333 },
    ])
  })

  it('adds several expenses together', () => {
    const expenses = [
      expense({}),
      expense({ id: 'e2', amountCents: 1200, payerId: 'sam', participantIds: ['alex', 'sam'] }),
      expense({ id: 'e3', amountCents: 1, payerId: 'kim', participantIds: ['kim'] }),
    ]
    expect(computeBalances(people, expenses)).toStrictEqual([
      { personId: 'alex', balanceCents: 1400 },
      { personId: 'sam', balanceCents: -400 },
      { personId: 'kim', balanceCents: -1000 },
    ])
  })

  it('keeps the sum of all balances at exactly zero', () => {
    const expenses = [
      expense({ amountCents: 1001 }),
      expense({ id: 'e2', amountCents: 999, payerId: 'kim', participantIds: ['alex', 'sam'] }),
      expense({ id: 'e3', amountCents: 7, payerId: 'sam' }),
    ]
    const sum = computeBalances(people, expenses).reduce(
      (total, balance) => total + balance.balanceCents,
      0,
    )
    expect(sum).toBe(0)
  })
})
