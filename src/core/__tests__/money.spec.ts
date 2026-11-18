import { describe, expect, it } from 'vitest'
import { formatCents, parseAmount } from '../money'

describe('parseAmount', () => {
  it.each([
    ['12', 1200],
    ['12.5', 1250],
    ['12.50', 1250],
    ['0.01', 1],
    ['$7.05', 705],
    ['  3.10  ', 310],
    ['0.10', 10],
    ['999999999.99', 99_999_999_999],
  ])('reads %j as %i cents', (text, cents) => {
    expect(parseAmount(text)).toBe(cents)
  })

  it.each(['', 'abc', '0', '0.00', '-5', '1.234', '1,50', '.50', '1.', '1e3', '1000000000'])(
    'rejects %j',
    (text) => {
      expect(parseAmount(text)).toBeUndefined()
    },
  )

  it('keeps 0.1 + 0.2 exact', () => {
    expect((parseAmount('0.1') ?? 0) + (parseAmount('0.2') ?? 0)).toBe(parseAmount('0.3'))
  })
})

describe('formatCents', () => {
  it.each([
    [0, '$0.00'],
    [5, '$0.05'],
    [1250, '$12.50'],
    [-1250, '-$12.50'],
    [-1, '-$0.01'],
    [123_456_789, '$1234567.89'],
  ])('formats %i as %s', (cents, text) => {
    expect(formatCents(cents)).toBe(text)
  })
})
