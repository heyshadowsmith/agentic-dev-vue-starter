import { parseAmount } from './money.ts'
import { fail, succeed, type Expense, type Ledger, type Result } from './types.ts'

const maxDescriptionLength = 80

export interface ExpenseDraft {
  readonly description: string
  readonly amount: string
  readonly payerId: string | undefined
  readonly participantIds: readonly string[]
}

export interface ExpenseStamp {
  readonly id: string
  readonly createdAt: string
}

const validateDescription = (text: string): Result<string> => {
  const description = text.trim()
  if (description === '') return fail('Enter a description.')
  if (description.length > maxDescriptionLength) return fail('The description is too long.')
  return succeed(description)
}

const validatePayer = (ledger: Ledger, payerId: string | undefined): Result<string> => {
  const payer = ledger.people.find((person) => person.id === payerId)
  return payer === undefined ? fail('Choose who paid.') : succeed(payer.id)
}

const validateParticipants = (
  ledger: Ledger,
  participantIds: readonly string[],
): Result<string[]> => {
  const ordered = ledger.people
    .filter((person) => participantIds.includes(person.id))
    .map((person) => person.id)
  if (participantIds.length === 0) return fail('Choose at least one person to split with.')
  if (ordered.length !== new Set(participantIds).size) return fail('Choose people in the group.')
  return succeed(ordered)
}

const withAmount = (
  ledger: Ledger,
  draft: ExpenseDraft,
  stamp: ExpenseStamp,
  description: string,
): Result<Expense> => {
  const amount = parseAmount(draft.amount)
  if (!amount.ok) return fail(amount.error)
  const payer = validatePayer(ledger, draft.payerId)
  if (!payer.ok) return fail(payer.error)
  const participants = validateParticipants(ledger, draft.participantIds)
  if (!participants.ok) return fail(participants.error)
  return succeed({
    id: stamp.id,
    description,
    amountCents: amount.value,
    payerId: payer.value,
    participantIds: participants.value,
    createdAt: stamp.createdAt,
  })
}

export const createExpense = (
  ledger: Ledger,
  draft: ExpenseDraft,
  stamp: ExpenseStamp,
): Result<Expense> => {
  const description = validateDescription(draft.description)
  return description.ok
    ? withAmount(ledger, draft, stamp, description.value)
    : fail(description.error)
}

export const addExpense = (
  ledger: Ledger,
  draft: ExpenseDraft,
  stamp: ExpenseStamp,
): Result<Ledger> => {
  const expense = createExpense(ledger, draft, stamp)
  return expense.ok
    ? succeed({ ...ledger, expenses: [...ledger.expenses, expense.value] })
    : fail(expense.error)
}

export const deleteExpense = (ledger: Ledger, expenseId: string): Ledger => ({
  ...ledger,
  expenses: ledger.expenses.filter((expense) => expense.id !== expenseId),
})
