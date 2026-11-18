const amountPattern = /^\$?(\d{1,9})(?:\.(\d{1,2}))?$/

export const parseAmount = (text: string): number | undefined => {
  const match = amountPattern.exec(text.trim())
  const whole = match?.[1]
  const fraction = match?.[2] ?? ''
  const cents = whole === undefined ? 0 : Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  return cents > 0 ? cents : undefined
}

export const formatCents = (cents: number): string => {
  const magnitude = Math.abs(cents)
  const dollars = Math.floor(magnitude / 100)
  const remainder = String(magnitude % 100).padStart(2, '0')
  return `${cents < 0 ? '-' : ''}$${String(dollars)}.${remainder}`
}
