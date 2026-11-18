import { describe, expect, it } from 'vitest'
import { addExpense, createExpense, deleteExpense, type ExpenseDraft } from '../expenses.ts'
import { alex, createdAt, expense, kim, ledgerOf, sam } from './fixtures.ts'

const ledger = ledgerOf([alex, sam, kim])
const stamp = { id: 'e1', createdAt }
const draft: ExpenseDraft = {
  description: ' Dinner ',
  amount: '25.00',
  payerId: 'alex',
  participantIds: ['kim', 'alex'],
}

describe('createExpense', () => {
  it('creates an expense with participants in the order of the group', () => {
    expect(createExpense(ledger, draft, stamp)).toStrictEqual({
      ok: true,
      value: {
        id: 'e1',
        description: 'Dinner',
        amountCents: 2500,
        payerId: 'alex',
        participantIds: ['alex', 'kim'],
        createdAt,
      },
    })
  })

  it.each([
    [{ description: '  ' }, 'Enter a description.'],
    [{ description: 'x'.repeat(81) }, 'The description is too long.'],
    [{ amount: '12.345' }, 'Enter an amount like 12.50.'],
    [{ amount: '0' }, 'The amount must be more than zero.'],
    [{ payerId: undefined }, 'Choose who paid.'],
    [{ payerId: 'ghost' }, 'Choose who paid.'],
    [{ participantIds: [] }, 'Choose at least one person to split with.'],
    [{ participantIds: ['alex', 'ghost'] }, 'Choose people in the group.'],
  ])('reports %j as %j', (changes, error) => {
    expect(createExpense(ledger, { ...draft, ...changes }, stamp)).toStrictEqual({
      ok: false,
      error,
    })
  })

  it('ignores a repeated participant', () => {
    const result = createExpense(ledger, { ...draft, participantIds: ['sam', 'sam'] }, stamp)
    expect(result).toStrictEqual({
      ok: true,
      value: expect.objectContaining({ participantIds: ['sam'] }),
    })
  })
})

describe('addExpense', () => {
  it('adds the expense to the end of the list', () => {
    const first = expense('e0', 100, 'sam', ['sam'])
    const result = addExpense(ledgerOf(ledger.people, [first]), draft, stamp)
    expect(result.ok && result.value.expenses.map((entry) => entry.id)).toStrictEqual(['e0', 'e1'])
  })

  it('reports a problem with the draft', () => {
    expect(addExpense(ledger, { ...draft, amount: '' }, stamp)).toStrictEqual({
      ok: false,
      error: 'Enter an amount like 12.50.',
    })
  })
})

describe('deleteExpense', () => {
  it('removes only the expense with the ID', () => {
    const first = expense('e1', 100, 'sam', ['sam'])
    const second = expense('e2', 200, 'alex', ['alex'])
    expect(deleteExpense(ledgerOf([alex, sam], [first, second]), 'e1')).toStrictEqual(
      ledgerOf([alex, sam], [second]),
    )
  })
})
