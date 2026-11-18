import { describe, expect, it } from 'vitest'
import { writeLedger } from '../core/stored-ledger'
import { storageKey } from '../stores/ledger-storage'
import { addPeople, itemsOf, mountApp, textOf } from './mount-app'

const createdAt = '2026-11-18T12:00:00.000Z'

describe('the settle-up page', () => {
  it('lists the payments that bring every balance to zero', async () => {
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
            description: 'Hotel',
            amountCents: 3000,
            payerId: 'alex',
            participantIds: ['alex', 'sam', 'kim'],
            createdAt,
          },
          {
            id: 'e2',
            description: 'Fuel',
            amountCents: 1500,
            payerId: 'sam',
            participantIds: ['sam', 'kim'],
            createdAt,
          },
        ],
      }),
    )
    const { wrapper } = await mountApp('/settle')
    expect(itemsOf(wrapper, 'Settle up')).toStrictEqual([
      'Kim pays Alex $17.50',
      'Sam pays Alex $2.50',
    ])
  })

  it('says that nobody needs to pay', async () => {
    const { wrapper, router } = await mountApp()
    await addPeople(wrapper, ['Alex'])
    await router.push('/settle')
    await wrapper.vm.$nextTick()
    expect(textOf(wrapper, 'Settle up')).toBe(
      'Settle upEveryone is settled up. Nobody needs to pay.',
    )
  })

  it('links to both pages', async () => {
    const { wrapper } = await mountApp('/settle')
    const links = wrapper.findAll('nav a').map((link) => [link.text(), link.attributes('href')])
    expect(links).toStrictEqual([
      ['Balances', '/'],
      ['Settle up', '/settle'],
    ])
    expect(wrapper.get('[aria-current="page"]').text()).toBe('Settle up')
  })
})
