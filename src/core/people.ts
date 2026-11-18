import { fail, succeed, type Ledger, type Person, type Result } from './types.ts'

const maxNameLength = 40

export const normalizeName = (name: string): string => name.trim().replaceAll(/\s+/g, ' ')

const isSameName = (first: string, second: string): boolean =>
  first.toLowerCase() === second.toLowerCase()

export const validateName = (name: string, people: readonly Person[]): Result<string> => {
  const normalized = normalizeName(name)
  if (normalized === '') return fail('Enter a name.')
  if (normalized.length > maxNameLength) return fail('The name is too long.')
  if (people.some((person) => isSameName(person.name, normalized))) {
    return fail(`${normalized} is already in the group.`)
  }
  return succeed(normalized)
}

export const addPerson = (ledger: Ledger, person: Person): Result<Ledger> => {
  const name = validateName(person.name, ledger.people)
  return name.ok
    ? succeed({ ...ledger, people: [...ledger.people, { id: person.id, name: name.value }] })
    : fail(name.error)
}

export const isInvolved = (ledger: Ledger, personId: string): boolean =>
  ledger.expenses.some(
    (expense) => expense.payerId === personId || expense.participantIds.includes(personId),
  )

export const removePerson = (ledger: Ledger, personId: string): Result<Ledger> => {
  return isInvolved(ledger, personId)
    ? fail('This person is part of an expense. Delete those expenses first.')
    : succeed({ ...ledger, people: ledger.people.filter((person) => person.id !== personId) })
}

export const nameOf = (people: readonly Person[], personId: string): string =>
  people.find((person) => person.id === personId)?.name ?? 'Unknown person'
