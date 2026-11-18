export interface Share {
  readonly personId: string
  readonly cents: number
}

export const splitEvenly = (amountCents: number, personIds: readonly string[]): Share[] => {
  const count = Math.max(personIds.length, 1)
  const base = Math.floor(amountCents / count)
  const leftover = amountCents % count
  return personIds.map((personId, index) => ({
    personId,
    cents: base + (index < leftover ? 1 : 0),
  }))
}
