import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createAgent } from '@ui-sdk/vue/agent'
import App from '../App.vue'
import { routes } from '../router'
import { storageKey } from '../stores/persistence'

let approve = false
const agent = createAgent({ allow: (step) => !step.confirm || approve })

const twoPeople = {
  version: 1,
  people: [
    { id: 'alex', name: 'Alex' },
    { id: 'sam', name: 'Sam' },
  ],
  expenses: [],
}

const dinner = {
  id: 'e1',
  description: 'Dinner',
  amountCents: 2500,
  payerId: 'sam',
  participantIds: ['alex', 'sam'],
  createdAt: '2026-11-18T19:30:00.000Z',
}

const store = (value: unknown) => {
  localStorage.setItem(storageKey, JSON.stringify(value))
}

const stored = (): unknown => JSON.parse(localStorage.getItem(storageKey) ?? 'null')

const mountAt = async (path: string) => {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  const wrapper = mount(App, {
    global: { plugins: [createPinia(), router] },
    attachTo: document.body,
  })
  await flushPromises()
  return { wrapper, router }
}

const control = (wrapper: VueWrapper, label: string) => {
  const labelElement = wrapper
    .findAll('label[data-slot="field-label"]')
    .find((element) => element.text() === label)
  return wrapper.find(`#${String(labelElement?.attributes('for'))}`)
}

const button = (wrapper: VueWrapper, name: string) => {
  const match = wrapper.findAll('button').find((element) => element.text() === name)
  expect(match, `No button named ${name}`).toBeDefined()
  return match
}

const balanceTexts = (wrapper: VueWrapper): string[] =>
  wrapper.findAll('#balances-heading ~ ul li').map((item) =>
    item
      .findAll('span')
      .map((part) => part.text())
      .join(' '),
  )

const addPersonThroughForm = async (wrapper: VueWrapper, name: string) => {
  await control(wrapper, 'Name').setValue(name)
  await wrapper.find('form').trigger('submit')
}

beforeEach(() => {
  localStorage.clear()
  approve = false
})

describe('navigation', () => {
  it('shows the balances page at /', async () => {
    const { wrapper } = await mountAt('/')
    expect(wrapper.find('h1').text()).toBe('Expense splitter')
    expect(wrapper.find('#balances-heading').text()).toBe('Balances')
    expect(wrapper.find('#expenses-heading').text()).toBe('Expenses')
  })

  it('shows the settle-up page at /settle', async () => {
    const { wrapper } = await mountAt('/settle')
    expect(wrapper.find('#settle-heading').text()).toBe('Settle up')
    expect(wrapper.text()).toContain('Everyone is settled up.')
  })

  it('moves between the pages with the main navigation', async () => {
    const { wrapper, router } = await mountAt('/')
    const links = wrapper.findAll('nav[aria-label="Main"] a')
    expect(links.map((link) => link.text())).toStrictEqual(['Balances', 'Settle up'])
    await links[1]?.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/settle')
  })
})

describe('people', () => {
  it('starts empty and asks for people', async () => {
    const { wrapper } = await mountAt('/')
    expect(wrapper.text()).toContain('Add the people who share the costs.')
    expect(wrapper.text()).toContain('Add people before you add an expense.')
  })

  it('adds a person with the form and saves the group', async () => {
    const { wrapper } = await mountAt('/')
    await addPersonThroughForm(wrapper, '  Alex ')
    expect(balanceTexts(wrapper)).toStrictEqual(['Alex $0.00'])
    expect(control(wrapper, 'Name').element).toHaveProperty('value', '')
    expect(stored()).toStrictEqual({
      version: 1,
      people: [{ id: expect.any(String), name: 'Alex' }],
      expenses: [],
    })
  })

  it('shows an error for a name that is already in the group', async () => {
    store(twoPeople)
    const { wrapper } = await mountAt('/')
    await addPersonThroughForm(wrapper, 'ALEX')
    expect(wrapper.find('[data-slot="field-error"]').text()).toBe('ALEX is already in the group.')
    expect(control(wrapper, 'Name').attributes('aria-invalid')).toBe('true')
  })

  it('shows an error for an empty name', async () => {
    const { wrapper } = await mountAt('/')
    await addPersonThroughForm(wrapper, ' ')
    expect(wrapper.find('[data-slot="field-error"]').text()).toBe('Enter a name.')
  })

  it('removes a person who is not part of an expense', async () => {
    store(twoPeople)
    const { wrapper } = await mountAt('/')
    await button(wrapper, 'Remove Alex')?.trigger('click')
    expect(balanceTexts(wrapper)).toStrictEqual(['Sam $0.00'])
  })

  it('does not let a person who is part of an expense be removed', async () => {
    store({
      ...twoPeople,
      people: [...twoPeople.people, { id: 'kim', name: 'Kim' }],
      expenses: [dinner],
    })
    const { wrapper } = await mountAt('/')
    expect(button(wrapper, 'Remove Alex')?.attributes('disabled')).toBe('')
    expect(button(wrapper, 'Remove Sam')?.attributes('disabled')).toBe('')
    expect(button(wrapper, 'Remove Kim')?.attributes('disabled')).toBeUndefined()
  })
})

describe('expenses', () => {
  it('shows an error for each missing field', async () => {
    store(twoPeople)
    const { wrapper } = await mountAt('/')
    await wrapper.findAll('form')[1]?.trigger('submit')
    const errors = wrapper.findAll('[data-slot="field-error"]').map((error) => error.text())
    expect(errors).toStrictEqual([
      '',
      'Enter a description.',
      'Enter an amount in dollars and cents, for example 12.50.',
      'Choose the person who paid.',
      'Choose at least one person to split with.',
    ])
  })

  it('adds an uneven expense and shows exact balances and payments', async () => {
    store({ ...twoPeople, people: [...twoPeople.people, { id: 'kim', name: 'Kim' }] })
    const { wrapper, router } = await mountAt('/')
    await control(wrapper, 'Description').setValue('Taxi')
    await control(wrapper, 'Amount').setValue('10')
    const result = await agent.act({
      steps: [{ ref: 'Paid by', action: 'setValue', args: ['Alex'] }],
    })
    expect(result.ok, result.error?.message).toBe(true)
    await wrapper.findAll('[role="checkbox"]')[0]?.trigger('click')
    await wrapper.findAll('[role="checkbox"]')[1]?.trigger('click')
    await wrapper.findAll('[role="checkbox"]')[2]?.trigger('click')
    await button(wrapper, 'Add expense')?.trigger('click')
    await wrapper.findAll('form')[1]?.trigger('submit')
    await flushPromises()

    expect(balanceTexts(wrapper)).toStrictEqual(['Alex +$6.66', 'Sam -$3.33', 'Kim -$3.33'])
    expect(wrapper.find('#expenses-heading ~ ul').text()).toContain('Taxi · $10.00')
    expect(wrapper.find('#expenses-heading ~ ul').text()).toContain(
      'Paid by Alex, split among Alex, Sam, Kim',
    )
    expect(control(wrapper, 'Description').element).toHaveProperty('value', '')

    await router.push('/settle')
    await flushPromises()
    expect(
      wrapper.findAll('ol li').map((item) => item.text().replaceAll(/\s+/g, ' ')),
    ).toStrictEqual(['Sam pays Alex $3.33', 'Kim pays Alex $3.33'])
  })

  it('records the time the expense was added', async () => {
    store({ ...twoPeople, expenses: [dinner] })
    const { wrapper } = await mountAt('/')
    expect(wrapper.find('time').attributes('datetime')).toBe('2026-11-18T19:30:00.000Z')
  })

  it('lists the newest expense first', async () => {
    store({
      ...twoPeople,
      expenses: [dinner, { ...dinner, id: 'e2', description: 'Lunch' }],
    })
    const { wrapper } = await mountAt('/')
    const descriptions = wrapper
      .findAll('#expenses-heading ~ ul li .font-medium')
      .map((item) => item.text())
    expect(descriptions).toStrictEqual(['Lunch · $25.00', 'Dinner · $25.00'])
  })

  it('deletes an expense and updates the balances', async () => {
    store({ ...twoPeople, expenses: [dinner] })
    const { wrapper } = await mountAt('/')
    expect(balanceTexts(wrapper)).toStrictEqual(['Alex -$12.50', 'Sam +$12.50'])
    await button(wrapper, 'Delete Dinner')?.trigger('click')
    expect(balanceTexts(wrapper)).toStrictEqual(['Alex $0.00', 'Sam $0.00'])
    expect(wrapper.text()).toContain('No expenses yet.')
  })
})

describe('storage', () => {
  it('restores people and expenses on reload', async () => {
    store({ ...twoPeople, expenses: [dinner] })
    const { wrapper } = await mountAt('/settle')
    expect(wrapper.find('ol li').text().replaceAll(/\s+/g, ' ')).toBe('Alex pays Sam $12.50')
  })

  it('starts empty when the stored data is not JSON', async () => {
    localStorage.setItem(storageKey, '{not json')
    const { wrapper } = await mountAt('/')
    expect(wrapper.text()).toContain('Add the people who share the costs.')
  })

  it('starts empty when the stored data has the wrong shape', async () => {
    store({ ...twoPeople, expenses: [{ ...dinner, payerId: 'nobody' }] })
    const { wrapper } = await mountAt('/')
    expect(balanceTexts(wrapper)).toStrictEqual([])
  })
})

describe('agents', () => {
  it('can find every control by name', async () => {
    store(twoPeople)
    await mountAt('/')
    const components = agent
      .snapshot()
      .filter((entry) => !entry.offPage && entry.component !== 'more')
    const unnamed = components.filter((entry) => !entry.label)
    expect(unnamed).toStrictEqual([])
    const labels = components.map((entry) => entry.label)
    expect(labels).toStrictEqual(
      expect.arrayContaining([
        'Name',
        'Add person',
        'Remove Alex',
        'Description',
        'Amount',
        'Paid by',
        'Split among',
        'Add expense',
      ]),
    )
  })

  it('can add a person and an expense', async () => {
    store(twoPeople)
    const { wrapper } = await mountAt('/')
    const people = await agent.act({
      steps: [
        { ref: 'Name', action: 'setValue', args: ['Kim'] },
        { ref: 'Add person', action: 'press' },
      ],
    })
    expect(people.ok, people.error?.message).toBe(true)
    await flushPromises()
    const group = agent
      .snapshot()
      .filter((entry) => !entry.offPage && entry.component === 'checkbox' && 'checked' in entry)
      .map((entry) => entry['value'])
    const expense = await agent.act({
      steps: [
        { ref: 'Description', action: 'setValue', args: ['Groceries'] },
        { ref: 'Amount', action: 'setValue', args: ['45.01'] },
        { ref: 'Paid by', action: 'setValue', args: ['Kim'] },
        { ref: 'Split among', action: 'setValue', args: [group] },
        { ref: 'Add expense', action: 'press' },
      ],
    })
    expect(expense.ok, expense.error?.message).toBe(true)
    await flushPromises()
    expect(balanceTexts(wrapper)).toStrictEqual(['Alex -$15.01', 'Sam -$15.00', 'Kim +$30.01'])
  })

  it('needs a person to approve a deleted expense', async () => {
    store({ ...twoPeople, expenses: [dinner] })
    const { wrapper } = await mountAt('/')
    const remove = { steps: [{ ref: 'Delete Dinner', action: 'press' }] }
    expect((await agent.act(remove)).ok).toBe(false)
    expect(wrapper.text()).toContain('Dinner · $25.00')
    approve = true
    expect((await agent.act(remove)).ok).toBe(true)
    await flushPromises()
    expect(wrapper.text()).toContain('No expenses yet.')
  })
})
