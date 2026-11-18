import type { Balance } from './balances'

export interface Payment {
  readonly fromId: string
  readonly toId: string
  readonly amountCents: number
}

interface Party {
  readonly personId: string
  readonly cents: number
}

const largestFirst = (parties: readonly Party[]): readonly Party[] =>
  [...parties].sort((first, second) => second.cents - first.cents)

const withRemainder = (rest: readonly Party[], party: Party, cents: number): readonly Party[] =>
  cents > 0
    ? [
        ...rest.filter((other) => other.cents >= cents),
        { personId: party.personId, cents },
        ...rest.filter((other) => other.cents < cents),
      ]
    : rest

const settleSorted = (
  creditors: readonly Party[],
  debtors: readonly Party[],
): readonly Payment[] => {
  const [creditor, ...otherCreditors] = creditors
  const [debtor, ...otherDebtors] = debtors
  if (creditor === undefined || debtor === undefined) return []
  const amountCents = Math.min(creditor.cents, debtor.cents)
  return [
    { fromId: debtor.personId, toId: creditor.personId, amountCents },
    ...settleSorted(
      withRemainder(otherCreditors, creditor, creditor.cents - amountCents),
      withRemainder(otherDebtors, debtor, debtor.cents - amountCents),
    ),
  ]
}

const partiesWhere = (balances: readonly Balance[], sign: 1 | -1): readonly Party[] =>
  largestFirst(
    balances
      .filter((balance) => balance.balanceCents * sign > 0)
      .map((balance) => ({ personId: balance.personId, cents: balance.balanceCents * sign })),
  )

export const settleUp = (balances: readonly Balance[]): readonly Payment[] =>
  settleSorted(partiesWhere(balances, 1), partiesWhere(balances, -1))
