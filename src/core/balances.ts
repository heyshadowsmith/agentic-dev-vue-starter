import { splitEvenly } from './split.ts'
import type { Expense, Ledger } from './types.ts'

export interface Balance {
  readonly personId: string
  readonly cents: number
}

const effectOn = (personId: string, expense: Expense): number => {
  const paid = expense.payerId === personId ? expense.amountCents : 0
  const share = splitEvenly(expense.amountCents, expense.participantIds).find(
    (entry) => entry.personId === personId,
  )
  return paid - (share?.cents ?? 0)
}

export const computeBalances = (ledger: Ledger): Balance[] =>
  ledger.people.map((person) => ({
    personId: person.id,
    cents: ledger.expenses
      .map((expense) => effectOn(person.id, expense))
      .reduce((total, cents) => total + cents, 0),
  }))
