import type { Balance } from './balances.ts'

export interface Payment {
  readonly fromId: string
  readonly toId: string
  readonly cents: number
}

interface Pair {
  readonly debtor: Balance
  readonly creditor: Balance
}

const largest = (balances: readonly Balance[], sign: 1 | -1): Balance | undefined => {
  const top = Math.max(0, ...balances.map((balance) => balance.cents * sign))
  return top === 0 ? undefined : balances.find((balance) => balance.cents * sign === top)
}

const exactPair = (balances: readonly Balance[]): Pair | undefined =>
  balances
    .filter((debtor) => debtor.cents < 0)
    .map((debtor) => ({
      debtor,
      creditor: balances.find((creditor) => creditor.cents === -debtor.cents),
    }))
    .find((pair): pair is Pair => pair.creditor !== undefined)

const largestPair = (balances: readonly Balance[]): Pair | undefined => {
  const debtor = largest(balances, -1)
  const creditor = largest(balances, 1)
  return debtor === undefined || creditor === undefined ? undefined : { debtor, creditor }
}

const applyPayment = (balances: readonly Balance[], payment: Payment): Balance[] =>
  balances.map((balance) => {
    if (balance.personId === payment.fromId) {
      return { ...balance, cents: balance.cents + payment.cents }
    }
    if (balance.personId === payment.toId) {
      return { ...balance, cents: balance.cents - payment.cents }
    }
    return balance
  })

export const settleUp = (balances: readonly Balance[]): Payment[] => {
  const pair = exactPair(balances) ?? largestPair(balances)
  if (pair === undefined) return []
  const payment = {
    fromId: pair.debtor.personId,
    toId: pair.creditor.personId,
    cents: Math.min(pair.creditor.cents, -pair.debtor.cents),
  }
  return [payment, ...settleUp(applyPayment(balances, payment))]
}
