import { parseAmount } from './money'

export interface Person {
  readonly id: string
  readonly name: string
}

export interface Expense {
  readonly id: string
  readonly description: string
  readonly amountCents: number
  readonly paidBy: string
  readonly splitAmong: readonly string[]
  readonly createdAt: string
}

export interface Ledger {
  readonly people: readonly Person[]
  readonly expenses: readonly Expense[]
}

export type Result<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: string }

export const emptyLedger: Ledger = { people: [], expenses: [] }

const success = <T>(value: T): Result<T> => ({ ok: true, value })
const failure = <T>(error: string): Result<T> => ({ ok: false, error })

const sameName = (first: string, second: string): boolean =>
  first.trim().toLowerCase() === second.trim().toLowerCase()

const hasPerson = (ledger: Ledger, personId: string): boolean =>
  ledger.people.some((person) => person.id === personId)

export const isInvolved = (ledger: Ledger, personId: string): boolean =>
  ledger.expenses.some(
    (expense) => expense.paidBy === personId || expense.splitAmong.includes(personId),
  )

export const addPerson = (ledger: Ledger, person: Person): Result<Ledger> => {
  const name = person.name.trim()
  if (name === '') return failure('Enter a name.')
  if (ledger.people.some((existing) => sameName(existing.name, name))) {
    return failure(`${name} is already in the group.`)
  }
  if (hasPerson(ledger, person.id)) return failure('That person ID is already in use.')
  return success({ ...ledger, people: [...ledger.people, { id: person.id, name }] })
}

export const removePerson = (ledger: Ledger, personId: string): Result<Ledger> => {
  if (!hasPerson(ledger, personId)) return failure('That person is not in the group.')
  if (isInvolved(ledger, personId)) {
    return failure('This person is part of an expense. Delete those expenses first.')
  }
  return success({
    ...ledger,
    people: ledger.people.filter((person) => person.id !== personId),
  })
}

export interface ExpenseDraft {
  readonly id: string
  readonly createdAt: string
  readonly description: string
  readonly amount: string
  readonly paidBy: string | null
  readonly splitAmong: readonly string[]
}

const splitError = (ledger: Ledger, draft: ExpenseDraft): string | undefined => {
  if (draft.splitAmong.length === 0 || draft.splitAmong.some((id) => !hasPerson(ledger, id))) {
    return 'Choose at least one person to split the expense with.'
  }
  if (ledger.expenses.some((expense) => expense.id === draft.id)) {
    return 'That expense ID is already in use.'
  }
  return undefined
}

const toExpense = (ledger: Ledger, draft: ExpenseDraft): Result<Expense> => {
  const description = draft.description.trim()
  const amountCents = parseAmount(draft.amount)
  const { paidBy } = draft
  if (description === '') return failure('Enter a description.')
  if (amountCents === undefined) {
    return failure('Enter an amount greater than zero, for example 12.50.')
  }
  if (paidBy === null || !hasPerson(ledger, paidBy)) return failure('Choose who paid.')
  const error = splitError(ledger, draft)
  if (error !== undefined) return failure(error)
  return success({
    id: draft.id,
    description,
    amountCents,
    paidBy,
    splitAmong: ledger.people
      .map((person) => person.id)
      .filter((personId) => draft.splitAmong.includes(personId)),
    createdAt: draft.createdAt,
  })
}

export const addExpense = (ledger: Ledger, draft: ExpenseDraft): Result<Ledger> => {
  const result = toExpense(ledger, draft)
  return result.ok
    ? success({ ...ledger, expenses: [...ledger.expenses, result.value] })
    : failure(result.error)
}

export const deleteExpense = (ledger: Ledger, expenseId: string): Ledger => ({
  ...ledger,
  expenses: ledger.expenses.filter((expense) => expense.id !== expenseId),
})
