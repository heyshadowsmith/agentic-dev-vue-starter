import { describe, expect, it } from 'vitest'
import { computeBalances } from '../balances.ts'
import { alex, expense, kim, ledgerOf, sam } from './fixtures.ts'

const sum = (balances: readonly { cents: number }[]) =>
  balances.reduce((total, balance) => total + balance.cents, 0)

describe('computeBalances', () => {
  it('gives zero to everyone without expenses', () => {
    expect(computeBalances(ledgerOf([alex, sam]))).toStrictEqual([
      { personId: 'alex', cents: 0 },
      { personId: 'sam', cents: 0 },
    ])
  })

  it('makes the payer owed the shares of the others', () => {
    const ledger = ledgerOf([alex, sam], [expense('e1', 2500, 'alex', ['alex', 'sam'])])
    expect(computeBalances(ledger)).toStrictEqual([
      { personId: 'alex', cents: 1250 },
      { personId: 'sam', cents: -1250 },
    ])
  })

  it('gives the full amount to the payer when the payer is not in the split', () => {
    const ledger = ledgerOf([alex, sam, kim], [expense('e1', 1000, 'alex', ['sam', 'kim'])])
    expect(computeBalances(ledger)).toStrictEqual([
      { personId: 'alex', cents: 1000 },
      { personId: 'sam', cents: -500 },
      { personId: 'kim', cents: -500 },
    ])
  })

  it('charges the leftover cent to the first person of an uneven split', () => {
    const ledger = ledgerOf([alex, sam, kim], [expense('e1', 1000, 'kim', ['alex', 'sam', 'kim'])])
    expect(computeBalances(ledger)).toStrictEqual([
      { personId: 'alex', cents: -334 },
      { personId: 'sam', cents: -333 },
      { personId: 'kim', cents: 667 },
    ])
  })
})

describe('computeBalances with several expenses', () => {
  it('combines several expenses', () => {
    const ledger = ledgerOf(
      [alex, sam, kim],
      [
        expense('e1', 3000, 'alex', ['alex', 'sam', 'kim']),
        expense('e2', 1500, 'sam', ['sam', 'kim']),
      ],
    )
    expect(computeBalances(ledger)).toStrictEqual([
      { personId: 'alex', cents: 2000 },
      { personId: 'sam', cents: -250 },
      { personId: 'kim', cents: -1750 },
    ])
  })

  it('gives zero when a person pays only for themselves', () => {
    const ledger = ledgerOf([alex, sam], [expense('e1', 999, 'alex', ['alex'])])
    expect(computeBalances(ledger)).toStrictEqual([
      { personId: 'alex', cents: 0 },
      { personId: 'sam', cents: 0 },
    ])
  })

  it('keeps the total of all balances at zero for uneven splits', () => {
    const ledger = ledgerOf(
      [alex, sam, kim],
      [
        expense('e1', 1001, 'alex', ['alex', 'sam', 'kim']),
        expense('e2', 7, 'sam', ['alex', 'kim']),
        expense('e3', 1, 'kim', ['alex', 'sam', 'kim']),
      ],
    )
    expect(sum(computeBalances(ledger))).toBe(0)
  })
})
