import { describe, expect, it } from 'vitest'
import { splitEvenly } from '../split'

const total = (shares: readonly { amountCents: number }[]): number =>
  shares.reduce((sum, share) => sum + share.amountCents, 0)

describe('splitEvenly', () => {
  it('splits an even amount into equal shares', () => {
    expect(splitEvenly(900, ['a', 'b', 'c'])).toStrictEqual([
      { personId: 'a', amountCents: 300 },
      { personId: 'b', amountCents: 300 },
      { personId: 'c', amountCents: 300 },
    ])
  })

  it('gives the leftover cent to the first participant', () => {
    expect(splitEvenly(1000, ['a', 'b', 'c'])).toStrictEqual([
      { personId: 'a', amountCents: 334 },
      { personId: 'b', amountCents: 333 },
      { personId: 'c', amountCents: 333 },
    ])
  })

  it('gives two leftover cents to the first two participants', () => {
    expect(splitEvenly(1001, ['a', 'b', 'c'])).toStrictEqual([
      { personId: 'a', amountCents: 334 },
      { personId: 'b', amountCents: 334 },
      { personId: 'c', amountCents: 333 },
    ])
  })

  it('follows the order of the participants, not their IDs', () => {
    expect(splitEvenly(101, ['z', 'a'])).toStrictEqual([
      { personId: 'z', amountCents: 51 },
      { personId: 'a', amountCents: 50 },
    ])
  })

  it('gives zero shares when there are fewer cents than participants', () => {
    expect(splitEvenly(2, ['a', 'b', 'c'])).toStrictEqual([
      { personId: 'a', amountCents: 1 },
      { personId: 'b', amountCents: 1 },
      { personId: 'c', amountCents: 0 },
    ])
  })

  it('gives the full amount to a single participant', () => {
    expect(splitEvenly(1999, ['a'])).toStrictEqual([{ personId: 'a', amountCents: 1999 }])
  })

  it('returns no shares when there are no participants', () => {
    expect(splitEvenly(500, [])).toStrictEqual([])
  })

  it.each([
    [1, 7],
    [100, 3],
    [99_999_999_999, 7],
    [12_345, 11],
  ])('keeps the total of %d cents among %d people', (amount, count) => {
    const ids = Array.from({ length: count }, (_, index) => `p${String(index)}`)
    expect(total(splitEvenly(amount, ids))).toBe(amount)
  })
})
