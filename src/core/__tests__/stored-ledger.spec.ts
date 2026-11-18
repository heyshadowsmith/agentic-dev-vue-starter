import { describe, expect, it } from 'vitest'
import { readLedger, writeLedger } from '../stored-ledger.ts'
import { emptyLedger } from '../types.ts'
import { alex, expense, ledgerOf, sam } from './fixtures.ts'

const ledger = ledgerOf([alex, sam], [expense('e1', 1001, 'alex', ['alex', 'sam'])])
const stored = { version: 1, ...ledger }
const storedExpense = stored.expenses[0]

const withExpense = (changes: Readonly<Record<string, unknown>>) => ({
  ...stored,
  expenses: [{ ...storedExpense, ...changes }],
})

describe('writeLedger and readLedger', () => {
  it('restore the same ledger', () => {
    const json = writeLedger(ledger)
    expect(readLedger(JSON.parse(json))).toStrictEqual(ledger)
  })

  it('restore an empty ledger', () => {
    const json = writeLedger(emptyLedger)
    expect(readLedger(JSON.parse(json))).toStrictEqual(emptyLedger)
  })

  it('drop unknown properties', () => {
    const extra = { ...stored, people: [{ ...alex, age: 3 }, sam], other: true }
    expect(readLedger(extra)).toStrictEqual(ledger)
  })
})

describe('readLedger with bad data', () => {
  it.each([
    ['nothing', undefined],
    ['an empty object', {}],
    ['a string', 'ledger'],
    ['an array', []],
    ['no version', { people: [], expenses: [] }],
    ['another version', { ...stored, version: 2 }],
    ['people that are not a list', { ...stored, people: {} }],
    ['expenses that are not a list', { ...stored, expenses: 'x' }],
    ['a person without a name', { ...stored, people: [{ id: 'alex' }, sam] }],
    ['a person with an empty name', { ...stored, people: [{ id: 'alex', name: '' }, sam] }],
    ['a person that is not an object', { ...stored, people: ['Alex', sam] }],
    ['the same person ID twice', { ...stored, people: [alex, { ...sam, id: 'alex' }] }],
    ['the same name twice', { ...stored, people: [alex, { ...sam, name: 'ALEX' }] }],
    ['the same expense ID twice', { ...stored, expenses: [storedExpense, storedExpense] }],
    ['a decimal amount', withExpense({ amountCents: 10.5 })],
    ['a zero amount', withExpense({ amountCents: 0 })],
    ['a text amount', withExpense({ amountCents: '10' })],
    ['an amount that is too large', withExpense({ amountCents: 100_000_000_000 })],
    ['an empty description', withExpense({ description: '' })],
    ['a bad date', withExpense({ createdAt: 'yesterday' })],
    ['an unknown payer', withExpense({ payerId: 'ghost' })],
    ['an unknown participant', withExpense({ participantIds: ['alex', 'ghost'] })],
    ['no participants', withExpense({ participantIds: [] })],
    ['a repeated participant', withExpense({ participantIds: ['alex', 'alex'] })],
    ['participants that are not text', withExpense({ participantIds: [1] })],
    ['participants that are not a list', withExpense({ participantIds: 'alex' })],
  ])('start empty for %s', (_, data) => {
    expect(readLedger(data)).toStrictEqual(emptyLedger)
  })
})
