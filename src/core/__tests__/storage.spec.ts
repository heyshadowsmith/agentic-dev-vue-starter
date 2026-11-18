import { describe, expect, it } from 'vitest'
import { failure, success } from '../result'
import { decodeState, encodeState } from '../storage'
import { emptyState, type SplitterState } from '../types'

const state: SplitterState = {
  people: [
    { id: 'alex', name: 'Alex' },
    { id: 'sam', name: 'Sam' },
  ],
  expenses: [
    {
      id: 'e1',
      description: 'Dinner',
      amountCents: 3001,
      payerId: 'alex',
      participantIds: ['alex', 'sam'],
      createdAt: '2026-11-18T12:00:00.000Z',
    },
  ],
}

const stored = (overrides: Record<string, unknown>): unknown => ({
  ...encodeState(state),
  ...overrides,
})

const storedExpense = (overrides: Record<string, unknown>): unknown =>
  stored({ expenses: [{ ...state.expenses[0], ...overrides }] })

const corrupt = failure('The stored data is not valid.')

describe('encodeState and decodeState', () => {
  it('adds a version to the stored state', () => {
    expect(encodeState(emptyState)).toStrictEqual({ version: 1, people: [], expenses: [] })
  })

  it('reads back what it stores', () => {
    const text = JSON.stringify(encodeState(state))
    expect(decodeState(JSON.parse(text))).toStrictEqual(success(state))
  })

  it('reads an empty stored state', () => {
    expect(decodeState(encodeState(emptyState))).toStrictEqual(success(emptyState))
  })
})

describe('decodeState refuses corrupt data', () => {
  it.each([
    ['null', null],
    ['a number', 42],
    ['a string', 'people'],
    ['a list', []],
    ['an object without a version', { people: [], expenses: [] }],
    ['another version', { version: 2, people: [], expenses: [] }],
    ['people that are not a list', { version: 1, people: {}, expenses: [] }],
    ['expenses that are missing', { version: 1, people: [] }],
  ])('refuses %s', (_, value) => {
    expect(decodeState(value)).toStrictEqual(corrupt)
  })

  it.each([
    ['a person that is not an object', ['Alex']],
    ['a person without an ID', [{ name: 'Alex' }]],
    ['a person with a number as name', [{ id: 'a', name: 3 }]],
    ['a person with an empty name', [{ id: 'a', name: '' }]],
    [
      'two people with the same name',
      [
        { id: 'a', name: 'Al' },
        { id: 'b', name: 'AL' },
      ],
    ],
    [
      'two people with the same ID',
      [
        { id: 'a', name: 'Al' },
        { id: 'a', name: 'Bo' },
      ],
    ],
    ['a corrupt person before a valid one', [{ id: 'a' }, { id: 'b', name: 'Bo' }]],
  ])('refuses %s', (_, people) => {
    expect(decodeState(stored({ people, expenses: [] }))).toStrictEqual(failure(expect.any(String)))
  })

  it.each([
    ['an amount with a fraction of a cent', { amountCents: 10.5 }],
    ['an amount as text', { amountCents: '3001' }],
    ['a zero amount', { amountCents: 0 }],
    ['a negative amount', { amountCents: -100 }],
    ['an amount that is too large', { amountCents: Number.MAX_SAFE_INTEGER }],
    ['an unknown payer', { payerId: 'nobody' }],
    ['a missing payer', { payerId: undefined }],
    ['an unknown participant', { participantIds: ['alex', 'nobody'] }],
    ['no participants', { participantIds: [] }],
    ['participants that are not text', { participantIds: [1, 2] }],
    ['participants that are not a list', { participantIds: 'alex' }],
    ['an empty description', { description: '' }],
    ['a missing ID', { id: undefined }],
    ['a date that is not valid', { createdAt: 'yesterday' }],
    ['a missing date', { createdAt: undefined }],
  ])('refuses an expense with %s', (_, overrides) => {
    expect(decodeState(storedExpense(overrides))).toStrictEqual(corrupt)
  })

  it('refuses an expense that is not an object', () => {
    expect(decodeState(stored({ expenses: [null] }))).toStrictEqual(corrupt)
  })

  it('refuses two expenses with the same ID', () => {
    const [expense] = state.expenses
    expect(decodeState(stored({ expenses: [expense, expense] }))).toStrictEqual(corrupt)
  })
})
