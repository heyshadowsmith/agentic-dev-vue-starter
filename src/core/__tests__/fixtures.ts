import type { Expense, Ledger, Person } from '../types.ts'

export const alex: Person = { id: 'alex', name: 'Alex' }
export const sam: Person = { id: 'sam', name: 'Sam' }
export const kim: Person = { id: 'kim', name: 'Kim' }

export const createdAt = '2026-11-18T12:00:00.000Z'

export const expense = (
  id: string,
  amountCents: number,
  payerId: string,
  participantIds: readonly string[],
): Expense => ({
  id,
  description: `Expense ${id}`,
  amountCents,
  payerId,
  participantIds,
  createdAt,
})

export const ledgerOf = (people: readonly Person[], expenses: readonly Expense[] = []): Ledger => ({
  people,
  expenses,
})
