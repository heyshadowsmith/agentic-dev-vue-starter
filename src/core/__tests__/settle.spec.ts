import { describe, expect, it } from 'vitest'
import type { Balance } from '../balances'
import { settleUp, type Payment } from '../settle'

const balances = (entries: Record<string, number>): Balance[] =>
  Object.entries(entries).map(([personId, cents]) => ({ personId, cents }))

const settledTotals = (start: readonly Balance[], payments: readonly Payment[]) =>
  start.map((balance) => {
    const paid = payments.filter((payment) => payment.from === balance.personId)
    const received = payments.filter((payment) => payment.to === balance.personId)
    return (
      balance.cents +
      paid.map((payment) => payment.cents).reduce((total, cents) => total + cents, 0) -
      received.map((payment) => payment.cents).reduce((total, cents) => total + cents, 0)
    )
  })

describe('settleUp', () => {
  it('needs no payments when everyone is even', () => {
    expect(settleUp(balances({ a: 0, b: 0 }))).toStrictEqual([])
  })

  it('needs no payments for nobody', () => {
    expect(settleUp([])).toStrictEqual([])
  })

  it('makes one payment between two people', () => {
    expect(settleUp(balances({ a: 1250, b: -1250 }))).toStrictEqual([
      { from: 'b', to: 'a', cents: 1250 },
    ])
  })

  it('makes two payments to one creditor', () => {
    expect(settleUp(balances({ a: 600, b: -300, c: -300 }))).toStrictEqual([
      { from: 'b', to: 'a', cents: 300 },
      { from: 'c', to: 'a', cents: 300 },
    ])
  })

  it('pairs exact opposite amounts first, in the order of the people', () => {
    expect(settleUp(balances({ a: 500, b: 300, c: -300, d: -500 }))).toStrictEqual([
      { from: 'c', to: 'b', cents: 300 },
      { from: 'd', to: 'a', cents: 500 },
    ])
  })

  it('matches the largest debt with the largest credit', () => {
    expect(settleUp(balances({ a: 700, b: 400, c: -600, d: -500 }))).toStrictEqual([
      { from: 'c', to: 'a', cents: 600 },
      { from: 'd', to: 'b', cents: 400 },
      { from: 'd', to: 'a', cents: 100 },
    ])
  })

  it('breaks ties by the order of the people', () => {
    expect(settleUp(balances({ a: -100, b: -100, c: 100, d: 100 }))).toStrictEqual([
      { from: 'a', to: 'c', cents: 100 },
      { from: 'b', to: 'd', cents: 100 },
    ])
  })

  it('settles odd cents from an uneven split', () => {
    expect(settleUp(balances({ a: -334, b: -333, c: 667 }))).toStrictEqual([
      { from: 'a', to: 'c', cents: 334 },
      { from: 'b', to: 'c', cents: 333 },
    ])
  })

  it('brings every balance to zero with fewer payments than people', () => {
    const start = balances({ a: 1234, b: -567, c: -1, d: 890, e: -1556, f: 0 })
    const payments = settleUp(start)
    expect(settledTotals(start, payments)).toStrictEqual([0, 0, 0, 0, 0, 0])
    expect(payments.length).toBeLessThan(start.length - 1)
    expect(payments.every((payment) => payment.cents > 0)).toBe(true)
  })
})
