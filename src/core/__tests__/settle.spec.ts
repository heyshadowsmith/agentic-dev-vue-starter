import { describe, expect, it } from 'vitest'
import type { Balance } from '../balances'
import { settleUp, type Payment } from '../settle'

const balances = (entries: Record<string, number>): Balance[] =>
  Object.entries(entries).map(([personId, balanceCents]) => ({ personId, balanceCents }))

const applyPayments = (start: Balance[], payments: readonly Payment[]): number[] =>
  start.map(
    (balance) =>
      balance.balanceCents +
      payments
        .filter((payment) => payment.fromId === balance.personId)
        .reduce((sum, payment) => sum + payment.amountCents, 0) -
      payments
        .filter((payment) => payment.toId === balance.personId)
        .reduce((sum, payment) => sum + payment.amountCents, 0),
  )

describe('settleUp', () => {
  it('returns no payments when nobody has a balance', () => {
    expect(settleUp(balances({ a: 0, b: 0 }))).toStrictEqual([])
  })

  it('returns no payments for an empty group', () => {
    expect(settleUp([])).toStrictEqual([])
  })

  it('makes one payment between two people', () => {
    expect(settleUp(balances({ alex: -1250, sam: 1250 }))).toStrictEqual([
      { fromId: 'alex', toId: 'sam', amountCents: 1250 },
    ])
  })

  it('lets two debtors pay one creditor', () => {
    expect(settleUp(balances({ alex: 2000, sam: -1000, kim: -1000 }))).toStrictEqual([
      { fromId: 'sam', toId: 'alex', amountCents: 1000 },
      { fromId: 'kim', toId: 'alex', amountCents: 1000 },
    ])
  })

  it('lets one debtor pay two creditors', () => {
    expect(settleUp(balances({ alex: 700, sam: 300, kim: -1000 }))).toStrictEqual([
      { fromId: 'kim', toId: 'alex', amountCents: 700 },
      { fromId: 'kim', toId: 'sam', amountCents: 300 },
    ])
  })

  it('pairs the largest debt with the largest credit first', () => {
    expect(settleUp(balances({ a: 500, b: 300, c: -300, d: -500 }))).toStrictEqual([
      { fromId: 'd', toId: 'a', amountCents: 500 },
      { fromId: 'c', toId: 'b', amountCents: 300 },
    ])
  })

  it('puts a partly paid creditor back in order of size', () => {
    expect(settleUp(balances({ a: 1000, b: 600, c: -700, d: -900 }))).toStrictEqual([
      { fromId: 'd', toId: 'a', amountCents: 900 },
      { fromId: 'c', toId: 'b', amountCents: 600 },
      { fromId: 'c', toId: 'a', amountCents: 100 },
    ])
  })

  it('breaks ties by the order of the balances', () => {
    expect(settleUp(balances({ a: 100, b: 100, c: -100, d: -100 }))).toStrictEqual([
      { fromId: 'c', toId: 'a', amountCents: 100 },
      { fromId: 'd', toId: 'b', amountCents: 100 },
    ])
  })

  it('settles single cents from uneven splits', () => {
    expect(settleUp(balances({ a: 666, b: -333, c: -333 }))).toStrictEqual([
      { fromId: 'b', toId: 'a', amountCents: 333 },
      { fromId: 'c', toId: 'a', amountCents: 333 },
    ])
  })

  it('brings every balance to zero with fewer payments than people', () => {
    const start = balances({ a: 1234, b: -1, c: 5000, d: -3333, e: -2900, f: 0 })
    const payments = settleUp(start)
    expect(applyPayments(start, payments)).toStrictEqual([0, 0, 0, 0, 0, 0])
    expect(payments.length).toBeLessThan(start.length - 1)
  })

  it('makes only positive payments', () => {
    const payments = settleUp(balances({ a: 10, b: 20, c: -5, d: -25 }))
    expect(payments.every((payment) => payment.amountCents > 0)).toBe(true)
  })
})
