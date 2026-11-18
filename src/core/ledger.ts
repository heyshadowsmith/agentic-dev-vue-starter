import { failure, success, type Result } from './result'
import type { Expense, Person, SplitterState } from './types'

export const maxNameLength = 40
export const maxDescriptionLength = 80

const collapseSpaces = (text: string): string => text.trim().replaceAll(/\s+/g, ' ')

const sameName = (first: string, second: string): boolean =>
  first.toLowerCase() === second.toLowerCase()

export const addPerson = (state: SplitterState, person: Person): Result<SplitterState> => {
  const name = collapseSpaces(person.name)
  if (name === '') return failure('Enter a name.')
  if (name.length > maxNameLength)
    return failure(`Enter a name of ${String(maxNameLength)} characters or fewer.`)
  if (state.people.some((other) => sameName(other.name, name))) {
    return failure(`${name} is already in the group.`)
  }
  if (person.id === '' || state.people.some((other) => other.id === person.id)) {
    return failure('Each person needs a different ID.')
  }
  return success({ ...state, people: [...state.people, { id: person.id, name }] })
}

export const isPersonInvolved = (state: SplitterState, personId: string): boolean =>
  state.expenses.some(
    (expense) => expense.payerId === personId || expense.participantIds.includes(personId),
  )

export const removePerson = (state: SplitterState, personId: string): Result<SplitterState> =>
  isPersonInvolved(state, personId)
    ? failure('This person is part of an expense. Delete those expenses first.')
    : success({ ...state, people: state.people.filter((person) => person.id !== personId) })

export interface ExpenseDraft {
  readonly id: string
  readonly createdAt: string
  readonly description: string
  readonly amount: Result<number>
  readonly payerId: string | null
  readonly participantIds: readonly string[]
}

export interface ExpenseErrors {
  readonly description: string | null
  readonly amount: string | null
  readonly payer: string | null
  readonly participants: string | null
}

const errorOf = <T>(result: Result<T>): string | null => (result.ok ? null : result.error)

const checkDescription = (text: string): Result<string> => {
  const description = collapseSpaces(text)
  if (description === '') return failure('Enter a description.')
  return description.length > maxDescriptionLength
    ? failure(`Enter a description of ${String(maxDescriptionLength)} characters or fewer.`)
    : success(description)
}

const checkPayer = (people: readonly Person[], payerId: string | null): Result<string> =>
  payerId !== null && people.some((person) => person.id === payerId)
    ? success(payerId)
    : failure('Choose the person who paid.')

const checkParticipants = (
  people: readonly Person[],
  participantIds: readonly string[],
): Result<readonly string[]> => {
  const ordered = people
    .filter((person) => participantIds.includes(person.id))
    .map((person) => person.id)
  if (ordered.length === 0) return failure('Choose at least one person to split with.')
  return ordered.length === new Set(participantIds).size
    ? success(ordered)
    : failure('Choose only people in the group.')
}

export const addExpense = (
  state: SplitterState,
  draft: ExpenseDraft,
): Result<SplitterState, ExpenseErrors> => {
  const description = checkDescription(draft.description)
  const payer = checkPayer(state.people, draft.payerId)
  const participants = checkParticipants(state.people, draft.participantIds)
  const { amount } = draft
  if (description.ok && amount.ok && payer.ok && participants.ok) {
    const expense: Expense = {
      id: draft.id,
      description: description.value,
      amountCents: amount.value,
      payerId: payer.value,
      participantIds: participants.value,
      createdAt: draft.createdAt,
    }
    return success({ ...state, expenses: [...state.expenses, expense] })
  }
  return failure({
    description: errorOf(description),
    amount: errorOf(amount),
    payer: errorOf(payer),
    participants: errorOf(participants),
  })
}

export const deleteExpense = (state: SplitterState, expenseId: string): SplitterState => ({
  ...state,
  expenses: state.expenses.filter((expense) => expense.id !== expenseId),
})
