import { describe, expect, it } from 'vitest'
import { splitEvenly } from '../split.ts'

const total = (shares: readonly { cents: number }[]) =>
  shares.reduce((sum, share) => sum + share.cents, 0)

describe('splitEvenly', () => {
  it('splits an even amount into equal shares', () => {
    expect(splitEvenly(900, ['a', 'b', 'c'])).toStrictEqual([
      { personId: 'a', cents: 300 },
      { personId: 'b', cents: 300 },
      { personId: 'c', cents: 300 },
    ])
  })

  it('gives the leftover cents to the first people in order', () => {
    expect(splitEvenly(1000, ['a', 'b', 'c'])).toStrictEqual([
      { personId: 'a', cents: 334 },
      { personId: 'b', cents: 333 },
      { personId: 'c', cents: 333 },
    ])
  })

  it('gives two leftover cents to the first two people', () => {
    expect(splitEvenly(1001, ['a', 'b', 'c'])).toStrictEqual([
      { personId: 'a', cents: 334 },
      { personId: 'b', cents: 334 },
      { personId: 'c', cents: 333 },
    ])
  })

  it('splits one cent among many people', () => {
    expect(splitEvenly(1, ['a', 'b', 'c'])).toStrictEqual([
      { personId: 'a', cents: 1 },
      { personId: 'b', cents: 0 },
      { personId: 'c', cents: 0 },
    ])
  })

  it('gives the full amount to a single person', () => {
    expect(splitEvenly(1999, ['a'])).toStrictEqual([{ personId: 'a', cents: 1999 }])
  })

  it('returns no shares for no people', () => {
    expect(splitEvenly(1000, [])).toStrictEqual([])
  })

  it.each([
    [1, 7],
    [100, 3],
    [9_999_999, 7],
    [99_999_999_999, 13],
  ])('keeps every cent of %i split %i ways', (amount, count) => {
    const ids = Array.from({ length: count }, (_, index) => `p${String(index)}`)
    expect(total(splitEvenly(amount, ids))).toBe(amount)
  })
})
