import { describe, expect, it } from 'vitest'
import { formatCents, parseAmount } from '../money.ts'

describe('parseAmount', () => {
  it.each([
    ['12', 1200],
    ['12.5', 1250],
    ['12.50', 1250],
    ['0.01', 1],
    ['$7.05', 705],
    [' 1,234.56 ', 123_456],
    ['0.10', 10],
    ['0.29', 29],
    ['999999999.99', 99_999_999_999],
  ])('reads %j as %i cents', (text, cents) => {
    expect(parseAmount(text)).toStrictEqual({ ok: true, value: cents })
  })

  it.each(['', 'abc', '12.345', '-5', '1e3', '12.', '.5', '1.2.3'])('rejects %j', (text) => {
    expect(parseAmount(text)).toStrictEqual({ ok: false, error: 'Enter an amount like 12.50.' })
  })

  it.each(['0', '0.00', '$0'])('rejects the zero amount %j', (text) => {
    expect(parseAmount(text)).toStrictEqual({
      ok: false,
      error: 'The amount must be more than zero.',
    })
  })

  it('rejects an amount that is too large', () => {
    expect(parseAmount('1000000000')).toStrictEqual({
      ok: false,
      error: 'The amount is too large.',
    })
  })
})

describe('formatCents', () => {
  it.each([
    [0, '$0.00'],
    [1, '$0.01'],
    [1250, '$12.50'],
    [-705, '-$7.05'],
    [123_456_789, '$1,234,567.89'],
  ])('formats %i cents as %s', (cents, text) => {
    expect(formatCents(cents)).toBe(text)
  })
})
