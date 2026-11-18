import { describe, expect, it } from 'vitest'
import {
  addExpense,
  addPerson,
  deleteExpense,
  isPersonInvolved,
  removePerson,
  type ExpenseDraft,
} from '../ledger'
import { failure, success } from '../result'
import { emptyState, type SplitterState } from '../types'

const group: SplitterState = {
  people: [
    { id: 'alex', name: 'Alex' },
    { id: 'sam', name: 'Sam' },
    { id: 'kim', name: 'Kim' },
  ],
  expenses: [],
}

const draft = (overrides: Partial<ExpenseDraft>): ExpenseDraft => ({
  id: 'e1',
  createdAt: '2026-11-18T12:00:00.000Z',
  description: 'Dinner',
  amount: success(3000),
  payerId: 'alex',
  participantIds: ['alex', 'sam'],
  ...overrides,
})

const withDinner: SplitterState = {
  ...group,
  expenses: [
    {
      id: 'e1',
      description: 'Dinner',
      amountCents: 3000,
      payerId: 'alex',
      participantIds: ['alex', 'sam'],
      createdAt: '2026-11-18T12:00:00.000Z',
    },
  ],
}

describe('addPerson', () => {
  it('adds a person with a trimmed name', () => {
    expect(addPerson(emptyState, { id: 'p1', name: '  Mary   Ann ' })).toStrictEqual(
      success({ people: [{ id: 'p1', name: 'Mary Ann' }], expenses: [] }),
    )
  })

  it('refuses an empty name', () => {
    expect(addPerson(group, { id: 'p1', name: ' '.repeat(3) })).toStrictEqual(
      failure('Enter a name.'),
    )
  })

  it('refuses a name that is too long', () => {
    expect(addPerson(group, { id: 'p1', name: 'x'.repeat(41) })).toStrictEqual(
      failure('Enter a name of 40 characters or fewer.'),
    )
  })

  it('refuses a name that differs only in case', () => {
    expect(addPerson(group, { id: 'p1', name: 'sAM' })).toStrictEqual(
      failure('sAM is already in the group.'),
    )
  })

  it('refuses an ID that is already in use', () => {
    expect(addPerson(group, { id: 'sam', name: 'Samuel' })).toStrictEqual(
      failure('Each person needs a different ID.'),
    )
  })

  it('refuses an empty ID', () => {
    expect(addPerson(group, { id: '', name: 'Samuel' })).toStrictEqual(
      failure('Each person needs a different ID.'),
    )
  })
})

describe('removePerson', () => {
  it('removes a person who is not part of an expense', () => {
    expect(removePerson(withDinner, 'kim')).toStrictEqual(
      success({ ...withDinner, people: withDinner.people.slice(0, 2) }),
    )
  })

  it('refuses to remove the payer of an expense', () => {
    expect(removePerson(withDinner, 'alex').ok).toBe(false)
  })

  it('refuses to remove a participant of an expense', () => {
    expect(removePerson(withDinner, 'sam')).toStrictEqual(
      failure('This person is part of an expense. Delete those expenses first.'),
    )
  })
})

describe('isPersonInvolved', () => {
  it.each([
    ['alex', true],
    ['sam', true],
    ['kim', false],
  ])('reports %s as %s', (personId, involved) => {
    expect(isPersonInvolved(withDinner, personId)).toBe(involved)
  })
})

describe('addExpense', () => {
  it('adds a valid expense', () => {
    expect(addExpense(group, draft({}))).toStrictEqual(success(withDinner))
  })

  it('stores the participants in the order of the group', () => {
    const result = addExpense(group, draft({ participantIds: ['kim', 'alex'] }))
    expect(result.ok && result.value.expenses[0]?.participantIds).toStrictEqual(['alex', 'kim'])
  })

  it('collapses spaces in the description', () => {
    const result = addExpense(group, draft({ description: '  Train   tickets ' }))
    expect(result.ok && result.value.expenses[0]?.description).toBe('Train tickets')
  })

  it('reports every invalid field', () => {
    expect(
      addExpense(
        group,
        draft({
          description: ' ',
          amount: failure('Enter an amount more than zero.'),
          payerId: null,
          participantIds: [],
        }),
      ),
    ).toStrictEqual(
      failure({
        description: 'Enter a description.',
        amount: 'Enter an amount more than zero.',
        payer: 'Choose the person who paid.',
        participants: 'Choose at least one person to split with.',
      }),
    )
  })

  it('refuses a description that is too long', () => {
    expect(addExpense(group, draft({ description: 'x'.repeat(81) }))).toStrictEqual(
      failure({
        description: 'Enter a description of 80 characters or fewer.',
        amount: null,
        payer: null,
        participants: null,
      }),
    )
  })

  it('refuses a payer who is not in the group', () => {
    expect(addExpense(group, draft({ payerId: 'nobody' }))).toStrictEqual(
      failure({
        description: null,
        amount: null,
        payer: 'Choose the person who paid.',
        participants: null,
      }),
    )
  })

  it('refuses a participant who is not in the group', () => {
    expect(addExpense(group, draft({ participantIds: ['alex', 'nobody'] }))).toStrictEqual(
      failure({
        description: null,
        amount: null,
        payer: null,
        participants: 'Choose only people in the group.',
      }),
    )
  })
})

describe('deleteExpense', () => {
  it('removes the expense with the ID', () => {
    expect(deleteExpense(withDinner, 'e1')).toStrictEqual(group)
  })

  it('keeps the state for an unknown ID', () => {
    expect(deleteExpense(withDinner, 'other')).toStrictEqual(withDinner)
  })
})
