import type { Ledger } from './ledger'
import { splitEvenly } from './split'
import { sum } from './sum'

export interface Balance {
  readonly personId: string
  readonly cents: number
}

const netFor = (ledger: Ledger, personId: string): number =>
  sum(
    ledger.expenses.map((expense) => {
      const paid = expense.paidBy === personId ? expense.amountCents : 0
      const owed = splitEvenly(expense.amountCents, expense.splitAmong).find(
        (share) => share.personId === personId,
      )
      return paid - (owed?.cents ?? 0)
    }),
  )

export const computeBalances = (ledger: Ledger): Balance[] =>
  ledger.people.map((person) => ({ personId: person.id, cents: netFor(ledger, person.id) }))
