export interface Person {
  readonly id: string
  readonly name: string
}

export interface Expense {
  readonly id: string
  readonly description: string
  readonly amountCents: number
  readonly payerId: string
  readonly participantIds: readonly string[]
  readonly createdAt: string
}

export interface SplitterState {
  readonly people: readonly Person[]
  readonly expenses: readonly Expense[]
}

export const emptyState: SplitterState = { people: [], expenses: [] }
