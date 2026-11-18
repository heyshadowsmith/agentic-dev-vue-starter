import { describe, expect, it } from 'vitest'
import { splitEvenly } from '../split'
import { sum } from '../sum'

describe('splitEvenly', () => {
  it('splits an even amount into equal shares', () => {
    expect(splitEvenly(900, ['a', 'b', 'c'])).toStrictEqual([
      { personId: 'a', cents: 300 },
      { personId: 'b', cents: 300 },
      { personId: 'c', cents: 300 },
    ])
  })

  it('gives one leftover cent to the first person', () => {
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

  it('gives the whole amount to a single person', () => {
    expect(splitEvenly(1234, ['a'])).toStrictEqual([{ personId: 'a', cents: 1234 }])
  })

  it('gives zero to some people when the amount is less than the head count', () => {
    expect(splitEvenly(2, ['a', 'b', 'c'])).toStrictEqual([
      { personId: 'a', cents: 1 },
      { personId: 'b', cents: 1 },
      { personId: 'c', cents: 0 },
    ])
  })

  it('returns no shares for nobody', () => {
    expect(splitEvenly(100, [])).toStrictEqual([])
  })

  it.each([
    [1, 7],
    [100, 3],
    [9999, 7],
    [10_000_001, 6],
  ])('shares of %i cents among %i people add up exactly', (total, count) => {
    const ids = Array.from({ length: count }, (_, index) => String(index))
    const shares = splitEvenly(total, ids).map((share) => share.cents)
    expect(sum(shares)).toBe(total)
    expect(Math.max(...shares) - Math.min(...shares)).toBeLessThanOrEqual(1)
  })
})

describe('sum', () => {
  it('returns 0 for no values', () => {
    expect(sum([])).toBe(0)
  })

  it('adds many values', () => {
    expect(sum([1, 2, 3, 4, 5])).toBe(15)
  })
})
