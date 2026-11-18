import { fail, succeed, type Result } from './types.ts'

export const maxAmountCents = 99_999_999_999

const amountPattern = /^\$?(\d+)(?:\.(\d{1,2}))?$/

const dollarFormat = new Intl.NumberFormat('en-US')

export const parseAmount = (text: string): Result<number> => {
  const match = amountPattern.exec(text.trim().replaceAll(',', ''))
  const dollars = match?.[1]
  if (dollars === undefined) return fail('Enter an amount like 12.50.')
  const cents = Number(dollars) * 100 + Number((match?.[2] ?? '').padEnd(2, '0'))
  if (cents <= 0) return fail('The amount must be more than zero.')
  if (cents > maxAmountCents) return fail('The amount is too large.')
  return succeed(cents)
}

export const formatCents = (cents: number): string => {
  const sign = cents < 0 ? '-' : ''
  const absolute = Math.abs(cents)
  const dollars = dollarFormat.format(Math.floor(absolute / 100))
  const remainder = String(absolute % 100).padStart(2, '0')
  return `${sign}$${dollars}.${remainder}`
}
