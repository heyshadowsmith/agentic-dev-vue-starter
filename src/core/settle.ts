import type { Balance } from './balances'

export interface Payment {
  readonly from: string
  readonly to: string
  readonly cents: number
}

type Pair = readonly [debtor: Balance, creditor: Balance]

const largest = (balances: readonly Balance[]): Balance | undefined => {
  const most = Math.max(...balances.map((balance) => balance.cents))
  return balances.find((balance) => balance.cents === most)
}

const exactPair = (
  debtors: readonly Balance[],
  creditors: readonly Balance[],
): Pair | undefined => {
  const debtor = debtors.find((candidate) =>
    creditors.some((creditor) => creditor.cents === -candidate.cents),
  )
  const creditor = creditors.find((candidate) => candidate.cents === -(debtor?.cents ?? 0))
  return debtor === undefined || creditor === undefined ? undefined : [debtor, creditor]
}

const largestPair = (
  debtors: readonly Balance[],
  creditors: readonly Balance[],
): Pair | undefined => {
  const debt = largest(debtors.map((balance) => ({ ...balance, cents: -balance.cents })))
  const creditor = largest(creditors)
  return debt === undefined || creditor === undefined
    ? undefined
    : [{ ...debt, cents: -debt.cents }, creditor]
}

const nextPair = (balances: readonly Balance[]): Pair | undefined => {
  const debtors = balances.filter((balance) => balance.cents < 0)
  const creditors = balances.filter((balance) => balance.cents > 0)
  return exactPair(debtors, creditors) ?? largestPair(debtors, creditors)
}

const adjust = (balance: Balance, payment: Payment): number => {
  if (balance.personId === payment.from) return balance.cents + payment.cents
  if (balance.personId === payment.to) return balance.cents - payment.cents
  return balance.cents
}

export const settleUp = (balances: readonly Balance[]): Payment[] => {
  const pair = nextPair(balances)
  if (pair === undefined) return []
  const [debtor, creditor] = pair
  const payment: Payment = {
    from: debtor.personId,
    to: creditor.personId,
    cents: Math.min(-debtor.cents, creditor.cents),
  }
  const remaining = balances.map((balance) => ({ ...balance, cents: adjust(balance, payment) }))
  return [payment, ...settleUp(remaining)]
}
