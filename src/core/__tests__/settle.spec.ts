import { describe, expect, it } from 'vitest'
import type { Balance } from '../balances.ts'
import { settleUp, type Payment } from '../settle.ts'

const balancesOf = (entries: Readonly<Record<string, number>>): Balance[] =>
  Object.entries(entries).map(([personId, cents]) => ({ personId, cents }))

const totalOf = (payments: readonly Payment[]) =>
  payments.reduce((total, payment) => total + payment.cents, 0)

const afterPayments = (balances: readonly Balance[], payments: readonly Payment[]) =>
  balances.map(
    (balance) =>
      balance.cents +
      totalOf(payments.filter((payment) => payment.fromId === balance.personId)) -
      totalOf(payments.filter((payment) => payment.toId === balance.personId)),
  )

describe('settleUp', () => {
  it('needs no payments when everyone is even', () => {
    expect(settleUp(balancesOf({ alex: 0, sam: 0 }))).toStrictEqual([])
  })

  it('needs no payments for no people', () => {
    expect(settleUp([])).toStrictEqual([])
  })

  it('makes one payment between two people', () => {
    expect(settleUp(balancesOf({ alex: 1250, sam: -1250 }))).toStrictEqual([
      { fromId: 'sam', toId: 'alex', cents: 1250 },
    ])
  })

  it('makes the largest debtor pay the largest creditor first', () => {
    expect(settleUp(balancesOf({ alex: 2000, sam: -250, kim: -1750 }))).toStrictEqual([
      { fromId: 'kim', toId: 'alex', cents: 1750 },
      { fromId: 'sam', toId: 'alex', cents: 250 },
    ])
  })

  it('pairs exact matches before others', () => {
    expect(settleUp(balancesOf({ alex: 500, sam: 300, kim: -300, lee: -500 }))).toStrictEqual([
      { fromId: 'kim', toId: 'sam', cents: 300 },
      { fromId: 'lee', toId: 'alex', cents: 500 },
    ])
  })

  it('splits a large debt across creditors', () => {
    expect(settleUp(balancesOf({ alex: 700, sam: 400, kim: -1100 }))).toStrictEqual([
      { fromId: 'kim', toId: 'alex', cents: 700 },
      { fromId: 'kim', toId: 'sam', cents: 400 },
    ])
  })

  it('breaks ties by the order of the people', () => {
    expect(settleUp(balancesOf({ alex: 100, sam: 100, kim: -150, lee: -50 }))).toStrictEqual([
      { fromId: 'kim', toId: 'alex', cents: 100 },
      { fromId: 'kim', toId: 'sam', cents: 50 },
      { fromId: 'lee', toId: 'sam', cents: 50 },
    ])
  })

  it('settles single cents', () => {
    expect(settleUp(balancesOf({ alex: -1, sam: 2, kim: -1 }))).toStrictEqual([
      { fromId: 'alex', toId: 'sam', cents: 1 },
      { fromId: 'kim', toId: 'sam', cents: 1 },
    ])
  })

  it('brings every balance to zero with fewer payments than people', () => {
    const balances = balancesOf({ a: 1234, b: -567, c: 89, d: -1001, e: 345, f: -100 })
    const payments = settleUp(balances)
    expect(afterPayments(balances, payments)).toStrictEqual([0, 0, 0, 0, 0, 0])
    expect(payments.length).toBeLessThan(balances.length)
  })

  it('makes only positive payments', () => {
    const payments = settleUp(balancesOf({ a: 10, b: 20, c: -5, d: -25 }))
    expect(payments.every((payment) => payment.cents > 0)).toBe(true)
  })
})
