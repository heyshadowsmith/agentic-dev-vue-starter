import { maxAmountCents } from './money.ts'
import { emptyLedger, type Expense, type Ledger, type Person } from './types.ts'

const storageVersion = 1

type UnknownRecord = Readonly<Record<string, unknown>>

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isText = (value: unknown): value is string => typeof value === 'string' && value !== ''

const isTextList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => isText(entry))

const isUnique = (values: readonly string[]): boolean => new Set(values).size === values.length

const isPerson = (value: unknown): value is Person =>
  isRecord(value) && isText(value['id']) && isText(value['name'])

const isAmount = (value: unknown): value is number =>
  Number.isSafeInteger(value) && Number(value) > 0 && Number(value) <= maxAmountCents

const isTimestamp = (value: unknown): value is string =>
  isText(value) && !Number.isNaN(Date.parse(value))

const isExpenseShape = (value: unknown): value is Expense =>
  isRecord(value) &&
  isText(value['id']) &&
  isText(value['description']) &&
  isAmount(value['amountCents']) &&
  isText(value['payerId']) &&
  isTextList(value['participantIds']) &&
  isTimestamp(value['createdAt'])

const isReferringToPeople = (expense: Expense, personIds: readonly string[]): boolean =>
  personIds.includes(expense.payerId) &&
  expense.participantIds.length > 0 &&
  isUnique(expense.participantIds) &&
  expense.participantIds.every((id) => personIds.includes(id))

const isConsistent = (people: readonly Person[], expenses: readonly Expense[]): boolean => {
  const personIds = people.map((person) => person.id)
  return (
    isUnique(personIds) &&
    isUnique(people.map((person) => person.name.toLowerCase())) &&
    isUnique(expenses.map((expense) => expense.id)) &&
    expenses.every((expense) => isReferringToPeople(expense, personIds))
  )
}

const toLedger = (people: readonly Person[], expenses: readonly Expense[]): Ledger => ({
  people: people.map((person) => ({ id: person.id, name: person.name })),
  expenses: expenses.map((expense) => ({
    id: expense.id,
    description: expense.description,
    amountCents: expense.amountCents,
    payerId: expense.payerId,
    participantIds: [...expense.participantIds],
    createdAt: expense.createdAt,
  })),
})

export const readLedger = (data: unknown): Ledger => {
  if (!isRecord(data) || data['version'] !== storageVersion) return emptyLedger
  const { people, expenses } = data
  const isValid =
    Array.isArray(people) &&
    Array.isArray(expenses) &&
    people.every((person) => isPerson(person)) &&
    expenses.every((expense) => isExpenseShape(expense)) &&
    isConsistent(people, expenses)
  return isValid ? toLedger(people, expenses) : emptyLedger
}

export const writeLedger = (ledger: Ledger): string =>
  JSON.stringify({ version: storageVersion, ...ledger })
