import { emptyLedger, type Expense, type Ledger, type Person } from './ledger'

type Fields = Readonly<Record<string, unknown>>

const isFields = (value: unknown): value is Fields =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isText = (value: unknown): value is string => typeof value === 'string' && value !== ''

const isTextList = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.length > 0 && value.every((item) => isText(item))

const isPerson = (value: unknown): value is Person =>
  isFields(value) && isText(value['id']) && isText(value['name']) && value['name'].trim() !== ''

const isExpenseShape = (value: unknown): value is Expense =>
  isFields(value) &&
  isText(value['id']) &&
  isText(value['description']) &&
  Number.isSafeInteger(value['amountCents']) &&
  Number(value['amountCents']) > 0 &&
  isText(value['paidBy']) &&
  isTextList(value['splitAmong']) &&
  isText(value['createdAt'])

const isUnique = (values: readonly string[]): boolean => new Set(values).size === values.length

const peopleAreValid = (people: readonly Person[]): boolean =>
  isUnique(people.map((person) => person.id)) &&
  isUnique(people.map((person) => person.name.trim().toLowerCase()))

const expensesAreValid = (expenses: readonly Expense[], people: readonly Person[]): boolean => {
  const ids = new Set(people.map((person) => person.id))
  return (
    isUnique(expenses.map((expense) => expense.id)) &&
    expenses.every(
      (expense) =>
        ids.has(expense.paidBy) &&
        isUnique(expense.splitAmong) &&
        expense.splitAmong.every((personId) => ids.has(personId)),
    )
  )
}

const toPerson = (person: Person): Person => ({ id: person.id, name: person.name.trim() })

const toExpense = (expense: Expense): Expense => ({
  id: expense.id,
  description: expense.description,
  amountCents: expense.amountCents,
  paidBy: expense.paidBy,
  splitAmong: [...expense.splitAmong],
  createdAt: expense.createdAt,
})

const decodeLists = (people: readonly Person[], expenses: readonly Expense[]): Ledger =>
  peopleAreValid(people) && expensesAreValid(expenses, people)
    ? {
        people: people.map((person) => toPerson(person)),
        expenses: expenses.map((expense) => toExpense(expense)),
      }
    : emptyLedger

export const decodeLedger = (value: unknown): Ledger => {
  const people: unknown = isFields(value) ? value['people'] : undefined
  const expenses: unknown = isFields(value) ? value['expenses'] : undefined
  const valid =
    Array.isArray(people) &&
    people.every((person) => isPerson(person)) &&
    Array.isArray(expenses) &&
    expenses.every((expense) => isExpenseShape(expense))
  return valid ? decodeLists(people, expenses) : emptyLedger
}
