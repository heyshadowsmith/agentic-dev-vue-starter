import { addExpense, addPerson } from './ledger'
import { maxAmountCents } from './money'
import { failure, success, type Result } from './result'
import { emptyState, type SplitterState } from './types'

const storageVersion = 1

export interface StoredState extends SplitterState {
  readonly version: typeof storageVersion
}

export const encodeState = (state: SplitterState): StoredState => ({
  version: storageVersion,
  people: state.people,
  expenses: state.expenses,
})

type UnknownRecord = Readonly<Record<string, unknown>>

const asRecord = (value: unknown): UnknownRecord | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null

const asList = (value: unknown): readonly unknown[] | null =>
  Array.isArray(value) ? (value as readonly unknown[]) : null

const asText = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null

const asTextList = (value: unknown): readonly string[] | null => {
  const list = asList(value)
  return list?.every((item) => asText(item) !== null) ? (list as readonly string[]) : null
}

const asCents = (value: unknown): Result<number> =>
  Number.isSafeInteger(value) && Number(value) > 0 && Number(value) <= maxAmountCents
    ? success(Number(value))
    : failure('The stored amount is not a whole number of cents.')

const asTimestamp = (value: unknown): string | null => {
  const text = asText(value)
  return text === null || Number.isNaN(Date.parse(text)) ? null : text
}

const corrupt = failure('The stored data is not valid.')

const decodePerson = (state: SplitterState, value: unknown): Result<SplitterState> => {
  const record = asRecord(value)
  const id = asText(record?.['id'])
  const name = asText(record?.['name'])
  return id === null || name === null ? corrupt : addPerson(state, { id, name })
}

const decodeExpense = (state: SplitterState, value: unknown): Result<SplitterState> => {
  const record = asRecord(value)
  const id = asText(record?.['id'])
  const description = asText(record?.['description'])
  const createdAt = asTimestamp(record?.['createdAt'])
  const participantIds = asTextList(record?.['participantIds'])
  if (
    id === null ||
    description === null ||
    createdAt === null ||
    participantIds === null ||
    state.expenses.some((expense) => expense.id === id)
  ) {
    return corrupt
  }
  const result = addExpense(state, {
    id,
    createdAt,
    description,
    amount: asCents(record?.['amountCents']),
    payerId: asText(record?.['payerId']),
    participantIds,
  })
  return result.ok ? result : corrupt
}

const decodeEach = (
  start: Result<SplitterState>,
  items: readonly unknown[] | null,
  decode: (state: SplitterState, value: unknown) => Result<SplitterState>,
): Result<SplitterState> =>
  items === null
    ? corrupt
    : items.reduce<Result<SplitterState>>(
        (result, item) => (result.ok ? decode(result.value, item) : result),
        start,
      )

export const decodeState = (value: unknown): Result<SplitterState> => {
  const record = asRecord(value)
  if (record?.['version'] !== storageVersion) return corrupt
  const withPeople = decodeEach(success(emptyState), asList(record['people']), decodePerson)
  return decodeEach(withPeople, asList(record['expenses']), decodeExpense)
}
