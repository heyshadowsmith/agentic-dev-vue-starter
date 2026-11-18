import { splitEvenly } from './split'
import type { Expense, Person } from './types'

export interface Balance {
  readonly personId: string
  readonly balanceCents: number
}

interface Delta {
  readonly personId: string
  readonly cents: number
}

const expenseDeltas = (expense: Expense): readonly Delta[] => [
  { personId: expense.payerId, cents: expense.amountCents },
  ...splitEvenly(expense.amountCents, expense.participantIds).map((share) => ({
    personId: share.personId,
    cents: 0 - share.amountCents,
  })),
]

export const computeBalances = (
  people: readonly Person[],
  expenses: readonly Expense[],
): readonly Balance[] => {
  const deltas = expenses.flatMap((expense) => expenseDeltas(expense))
  return people.map((person) => ({
    personId: person.id,
    balanceCents: deltas
      .filter((delta) => delta.personId === person.id)
      .reduce((sum, delta) => sum + delta.cents, 0),
  }))
}
