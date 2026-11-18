import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { mountApp, sampleLedger, storeLedger } from './mount-app'

beforeEach(() => {
  localStorage.clear()
})

describe('settle-up page', () => {
  it('says everyone is settled without debts', async () => {
    const { wrapper } = await mountApp('/settle')
    expect(wrapper.text()).toContain('Everyone is settled up.')
  })

  it('lists the payments that settle every balance', async () => {
    storeLedger(sampleLedger)
    const { wrapper } = await mountApp('/settle')
    expect(wrapper.findAll('li').map((item) => item.text())).toStrictEqual(['Alex pays Sam $12.50'])
  })

  it('opens from the navigation link', async () => {
    storeLedger(sampleLedger)
    const { wrapper, router } = await mountApp('/')
    await wrapper.find('a[href="/settle"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/settle')
    expect(wrapper.text()).toContain('Alex pays Sam $12.50')
  })
})
