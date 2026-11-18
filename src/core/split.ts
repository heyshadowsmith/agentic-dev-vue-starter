export interface Share {
  readonly personId: string
  readonly cents: number
}

export const splitEvenly = (totalCents: number, personIds: readonly string[]): Share[] => {
  const count = personIds.length
  const base = count === 0 ? 0 : Math.floor(totalCents / count)
  const leftover = totalCents - base * count
  return personIds.map((personId, index) => ({
    personId,
    cents: base + (index < leftover ? 1 : 0),
  }))
}
