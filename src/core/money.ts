import { failure, success, type Result } from './result'

export const maxAmountCents = 99_999_999_999

const amountPattern = /^\$?(?=\.?\d)(\d*)\.?(\d{0,2})$/

export const parseCents = (text: string): Result<number> => {
  const match = amountPattern.exec(text.trim().replaceAll(',', ''))
  if (!match) return failure('Enter an amount in dollars and cents, for example 12.50.')
  const dollars = Number(match[1])
  const cents = Number(String(match[2]).padEnd(2, '0'))
  const total = dollars * 100 + cents
  if (total <= 0) return failure('Enter an amount more than zero.')
  return total > maxAmountCents
    ? failure('Enter an amount less than one billion dollars.')
    : success(total)
}

const groupThousands = (digits: string): string =>
  digits.length <= 3 ? digits : `${groupThousands(digits.slice(0, -3))},${digits.slice(-3)}`

export const formatCents = (cents: number): string => {
  const absolute = Math.abs(cents)
  const sign = cents < 0 ? '-' : ''
  const dollars = groupThousands(Math.trunc(absolute / 100).toString())
  const remainder = (absolute % 100).toString().padStart(2, '0')
  return `${sign}$${dollars}.${remainder}`
}

export const formatSignedCents = (cents: number): string =>
  cents > 0 ? `+${formatCents(cents)}` : formatCents(cents)
