export interface Share {
  readonly personId: string
  readonly amountCents: number
}

export const splitEvenly = (
  amountCents: number,
  participantIds: readonly string[],
): readonly Share[] => {
  const count = participantIds.length
  const base = Math.floor(amountCents / Math.max(count, 1))
  const leftover = amountCents - base * count
  return participantIds.map((personId, index) => ({
    personId,
    amountCents: index < leftover ? base + 1 : base,
  }))
}
