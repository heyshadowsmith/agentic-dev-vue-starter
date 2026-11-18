import { describe, expect, it, vi } from 'vitest'
import { storageKey } from '../stores/ledger-storage'
import { addPeople, itemsOf, mountApp, textOf } from './mount-app'

describe('saved data', () => {
  it('restores people after a reload', async () => {
    const first = await mountApp()
    await addPeople(first.wrapper, ['Alex', 'Sam'])
    first.wrapper.unmount()
    const second = await mountApp()
    expect(itemsOf(second.wrapper, 'People')).toStrictEqual(['Alex Remove Alex', 'Sam Remove Sam'])
  })

  it.each([
    ['text that is not JSON', '{not json'],
    ['JSON of the wrong shape', '{"version":1,"people":"Alex"}'],
    ['an expense for an unknown person', '{"version":1,"people":[],"expenses":[{"id":"e"}]}'],
  ])('starts empty for %s', async (_, text) => {
    localStorage.setItem(storageKey, text)
    const { wrapper } = await mountApp()
    expect(textOf(wrapper, 'People')).toContain('Nobody is in the group yet.')
  })

  it('keeps working when the browser refuses to save', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded')
    })
    const { wrapper } = await mountApp()
    await addPeople(wrapper, ['Alex'])
    expect(setItem).toHaveBeenCalledOnce()
    setItem.mockRestore()
    expect(itemsOf(wrapper, 'People')).toStrictEqual(['Alex Remove Alex'])
  })
})
