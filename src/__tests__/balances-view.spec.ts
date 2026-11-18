import { flushPromises } from '@vue/test-utils'
import { createAgent } from '@ui-sdk/vue/agent'
import { beforeEach, describe, expect, it } from 'vitest'
import { mountApp, sampleLedger, storedLedger, storeLedger } from './mount-app'

const permission = { approve: false }
const agent = createAgent({ allow: (step) => !step.confirm || permission.approve })

const checkboxValue = (label: string) =>
  agent.snapshot().find((entry) => entry.component === 'checkbox' && entry.label === label)?.[
    'value'
  ]

beforeEach(() => {
  localStorage.clear()
  permission.approve = false
})

describe('balances page', () => {
  it('shows empty states without data', async () => {
    const { wrapper } = await mountApp()
    expect(wrapper.text()).toContain('No people yet.')
    expect(wrapper.text()).toContain('No expenses yet.')
    expect(wrapper.text()).toContain('Add people first.')
  })

  it('shows balances and expenses from stored data', async () => {
    storeLedger(sampleLedger)
    const { wrapper } = await mountApp()
    expect(wrapper.text()).toContain('Alex owes $12.50')
    expect(wrapper.text()).toContain('Sam is owed $12.50')
    expect(wrapper.text()).toContain('Taxi: $25.00')
    expect(wrapper.text()).toContain('Paid by Sam, split among Alex, Sam.')
    expect(wrapper.find('time').attributes('datetime')).toBe('2026-11-18T12:00:00.000Z')
  })

  it('adds a person from the form and clears the name', async () => {
    const { wrapper } = await mountApp()
    await wrapper.find('input').setValue('  Alex ')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('Alex is settled up')
    expect(wrapper.find('input').element.value).toBe('')
  })

  it('shows an error for a duplicate name', async () => {
    storeLedger(sampleLedger)
    const { wrapper } = await mountApp()
    const nameInput = wrapper.findAll('input').at(-1)
    await nameInput?.setValue('sam')
    await wrapper.findAll('form').at(-1)?.trigger('submit')
    expect(wrapper.find('[role="alert"]').text()).toBe('sam is already in the group.')
  })

  it('disables Remove for a person in an expense', async () => {
    storeLedger({
      ...sampleLedger,
      people: [...sampleLedger.people, { id: 'p-kim', name: 'Kim' }],
    })
    const { wrapper } = await mountApp()
    const personButtons = wrapper
      .findAll('button')
      .filter((button) => button.text().startsWith('Remove'))
    expect(personButtons.map((button) => button.attributes('disabled'))).toStrictEqual([
      '',
      '',
      undefined,
    ])
    await personButtons[2]?.trigger('click')
    expect(wrapper.text()).not.toContain('Kim')
  })

  it('shows the error when an expense is not complete', async () => {
    storeLedger(sampleLedger)
    const { wrapper } = await mountApp()
    await wrapper.findAll('form')[0]?.trigger('submit')
    expect(wrapper.find('[role="alert"]').text()).toBe('Enter a description.')
  })

  it('lets an agent find every control and add an expense', async () => {
    storeLedger({ ...sampleLedger, expenses: [] })
    const { wrapper } = await mountApp()

    const components = agent.snapshot().filter((entry) => !entry.offPage)
    expect(components.every((entry) => Boolean(entry.label))).toBe(true)
    expect(components.map((entry) => entry.label)).toStrictEqual([
      'Description',
      'Amount',
      'Paid by',
      'Alex',
      'Sam',
      'Split among',
      'Add expense',
      'Person name',
      'Add person',
      'Remove Alex',
      'Remove Sam',
    ])

    const result = await agent.act({
      steps: [
        { ref: 'Description', action: 'setValue', args: ['Dinner'] },
        { ref: 'Amount', action: 'setValue', args: ['10.00'] },
        { ref: 'Paid by', action: 'setValue', args: ['Alex'] },
        {
          ref: 'Split among',
          action: 'setValue',
          args: [[checkboxValue('Alex'), checkboxValue('Sam')]],
        },
        { ref: 'Add expense', action: 'press', args: [] },
      ],
    })
    await flushPromises()
    expect(result).toMatchObject({ ok: true })
    expect(wrapper.text()).toContain('Dinner: $10.00')
    expect(wrapper.text()).toContain('Alex is owed $5.00')
    expect(storedLedger()).toMatchObject({
      expenses: [{ description: 'Dinner', amountCents: 1000 }],
    })
  })

  it('asks a person before an agent deletes an expense', async () => {
    storeLedger(sampleLedger)
    const { wrapper } = await mountApp()
    const remove = { steps: [{ ref: 'Delete Taxi', action: 'press', args: [] }] }

    const refused = await agent.act(remove)
    expect(refused.ok).toBe(false)
    expect(wrapper.text()).toContain('Taxi: $25.00')

    permission.approve = true
    const approved = await agent.act(remove)
    expect(approved.ok).toBe(true)
    await flushPromises()
    expect(wrapper.text()).toContain('No expenses yet.')
  })
})
