import { describe, expect, it } from 'vitest'
import { formatCents, formatSignedCents, maxAmountCents, parseCents } from '../money'

describe('parseCents', () => {
  it.each([
    ['12.50', 1250],
    ['12.5', 1250],
    ['12', 1200],
    ['0.01', 1],
    ['.75', 75],
    ['$4.20', 420],
    [' '.repeat(2) + '7.05 ', 705],
    ['3.', 300],
    ['1,234.56', 123_456],
    ['0.10', 10],
    ['999999999.99', maxAmountCents],
  ])('reads %j as %d cents', (text, cents) => {
    expect(parseCents(text)).toStrictEqual({ ok: true, value: cents })
  })

  it('reads 0.29 exactly, where floating point gives 28.999…', () => {
    expect(parseCents('0.29')).toStrictEqual({ ok: true, value: 29 })
  })

  it.each(['', ' '.repeat(3), '$', '.', 'abc', '1.234', '1..', '-5', '1e3', '12.5.0', '$-1'])(
    'refuses %j',
    (text) => {
      expect(parseCents(text)).toStrictEqual({
        ok: false,
        error: 'Enter an amount in dollars and cents, for example 12.50.',
      })
    },
  )

  it.each(['0', '0.00', '$0'])('refuses the zero amount %j', (text) => {
    expect(parseCents(text)).toStrictEqual({
      ok: false,
      error: 'Enter an amount more than zero.',
    })
  })

  it('refuses an amount above the maximum', () => {
    expect(parseCents('1000000000')).toStrictEqual({
      ok: false,
      error: 'Enter an amount less than one billion dollars.',
    })
  })
})

describe('formatCents', () => {
  it.each([
    [0, '$0.00'],
    [1, '$0.01'],
    [1250, '$12.50'],
    [100_000, '$1,000.00'],
    [123_456_789, '$1,234,567.89'],
    [-705, '-$7.05'],
    [-123_456, '-$1,234.56'],
  ])('formats %d as %s', (cents, text) => {
    expect(formatCents(cents)).toBe(text)
  })
})

describe('formatSignedCents', () => {
  it.each([
    [1250, '+$12.50'],
    [0, '$0.00'],
    [-1250, '-$12.50'],
  ])('formats %d as %s', (cents, text) => {
    expect(formatSignedCents(cents)).toBe(text)
  })
})
