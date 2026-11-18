import { flushPromises } from '@vue/test-utils'
import { createAgent } from '@ui-sdk/vue/agent'
import { describe, expect, it } from 'vitest'
import { addPeople, itemsOf, mountApp, textOf } from './mount-app'

const state = { approve: false }
const agent = createAgent({ allow: (step) => !step.confirm || state.approve })

const visible = () =>
  agent.snapshot().filter((entry) => !entry.offPage && entry.component !== 'more')

const dinnerSteps = {
  steps: [
    { ref: 'Description', action: 'setValue', args: ['Dinner'] },
    { ref: 'Amount in dollars', action: 'setValue', args: ['10.00'] },
    { ref: 'Paid by', action: 'setValue', args: ['Alex'] },
    { ref: 'Add expense', action: 'press', args: [] },
  ],
}

describe('the expense splitter with an agent', () => {
  it('names every control', async () => {
    const { wrapper } = await mountApp()
    await addPeople(wrapper, ['Alex', 'Sam'])
    const labels = visible().map((entry) => entry.label)
    expect(labels.every((label) => typeof label === 'string' && label !== '')).toBe(true)
    expect(labels).toStrictEqual(
      expect.arrayContaining([
        'Person name',
        'Add person',
        'Description',
        'Amount in dollars',
        'Paid by',
        'Split equally among',
        'Add expense',
        'Remove Alex',
        'Remove Sam',
      ]),
    )
  })

  it('adds an expense', async () => {
    const { wrapper } = await mountApp()
    await addPeople(wrapper, ['Alex', 'Sam', 'Kim'])
    const result = await agent.act(dinnerSteps)
    await flushPromises()
    expect(result.error?.message).toBeUndefined()
    expect(itemsOf(wrapper, 'Balances')).toStrictEqual([
      'Alex is owed $6.66$6.66',
      'Sam owes $3.33-$3.33',
      'Kim owes $3.33-$3.33',
    ])
  })

  it('needs a person to delete an expense', async () => {
    const { wrapper } = await mountApp()
    await addPeople(wrapper, ['Alex', 'Sam'])
    await agent.act(dinnerSteps)
    await flushPromises()
    const remove = {
      steps: [{ ref: 'Delete expense Dinner, $10.00', action: 'press', args: [] }],
    }
    state.approve = false
    const refused = await agent.act(remove)
    expect(refused.ok).toBe(false)
    state.approve = true
    const allowed = await agent.act(remove)
    expect(allowed.ok).toBe(true)
    await flushPromises()
    expect(textOf(wrapper, 'Expenses')).toContain('No expenses yet.')
  })
})
