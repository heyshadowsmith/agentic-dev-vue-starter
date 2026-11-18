import { describe, expect, it } from 'vitest'
import { writeLedger } from '../core/stored-ledger'
import { storageKey } from '../stores/ledger-storage'
import {
  addPeople,
  buttonNamed,
  buttonNames,
  controlFor,
  itemsOf,
  mountApp,
  textOf,
} from './mount-app'

const seed = () => {
  localStorage.setItem(
    storageKey,
    writeLedger({
      people: [
        { id: 'alex', name: 'Alex' },
        { id: 'sam', name: 'Sam' },
        { id: 'kim', name: 'Kim' },
      ],
      expenses: [
        {
          id: 'e1',
          description: 'Taxi',
          amountCents: 1000,
          payerId: 'alex',
          participantIds: ['alex', 'sam'],
          createdAt: '2026-11-18T12:00:00.000Z',
        },
      ],
    }),
  )
}

describe('the people section', () => {
  it('starts empty', async () => {
    const { wrapper } = await mountApp()
    expect(textOf(wrapper, 'People')).toContain('Nobody is in the group yet.')
  })

  it('adds people in order and clears the field', async () => {
    const { wrapper } = await mountApp()
    await addPeople(wrapper, ['Alex', '  Sam  '])
    expect(itemsOf(wrapper, 'People')).toStrictEqual(['Alex Remove Alex', 'Sam Remove Sam'])
    expect(controlFor(wrapper, 'Person name').element).toHaveProperty('value', '')
  })

  it('refuses a name that differs only in case', async () => {
    const { wrapper } = await mountApp()
    await addPeople(wrapper, ['Alex', 'ALEX'])
    expect(itemsOf(wrapper, 'People')).toStrictEqual(['Alex Remove Alex'])
    expect(textOf(wrapper, 'People')).toContain('ALEX is already in the group.')
  })

  it('refuses an empty name', async () => {
    const { wrapper } = await mountApp()
    await addPeople(wrapper, [' '.repeat(3)])
    expect(textOf(wrapper, 'People')).toContain('Enter a name.')
  })

  it('removes a person without expenses', async () => {
    seed()
    const { wrapper } = await mountApp()
    await buttonNamed(wrapper, 'Remove Kim').trigger('click')
    expect(itemsOf(wrapper, 'People')).toStrictEqual([
      'Alex Part of an expense',
      'Sam Part of an expense',
    ])
  })

  it('offers no remove button for people in an expense', async () => {
    seed()
    const { wrapper } = await mountApp()
    expect(buttonNames(wrapper)).toStrictEqual([
      'Add person',
      'Remove Kim',
      'Add expense',
      'Delete expense Taxi, $10.00',
    ])
  })
})

describe('the expense list', () => {
  it('shows the expense details', async () => {
    seed()
    const { wrapper } = await mountApp()
    expect(itemsOf(wrapper, 'Expenses')[0]).toMatch(
      /^Taxi, \$10\.00Alex paid\. Split among Alex, Sam\. .+ Delete expense Taxi, \$10\.00$/,
    )
    expect(wrapper.get('time').attributes('datetime')).toBe('2026-11-18T12:00:00.000Z')
  })

  it('deletes an expense and updates the balances', async () => {
    seed()
    const { wrapper } = await mountApp()
    await buttonNamed(wrapper, 'Delete expense Taxi, $10.00').trigger('click')
    expect(textOf(wrapper, 'Expenses')).toContain('No expenses yet.')
    expect(itemsOf(wrapper, 'Balances')).toStrictEqual([
      'Alex is settled up$0.00',
      'Sam is settled up$0.00',
      'Kim is settled up$0.00',
    ])
  })

  it('reports a missing payer', async () => {
    seed()
    const { wrapper } = await mountApp()
    await controlFor(wrapper, 'Description').setValue('Lunch')
    await controlFor(wrapper, 'Amount in dollars').setValue('9')
    await wrapper.findAll('form')[1]?.trigger('submit')
    expect(wrapper.get('[role="alert"]').text()).toBe('Choose who paid.')
  })
})
