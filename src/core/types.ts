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

export interface Ledger {
  readonly people: readonly Person[]
  readonly expenses: readonly Expense[]
}

export type Result<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string }

export const succeed = <T>(value: T): Result<T> => ({ ok: true, value })

export const fail = <T>(error: string): Result<T> => ({ ok: false, error })

export const emptyLedger: Ledger = { people: [], expenses: [] }
