import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { makePrompt, mountApp, seed, typeInto } from './helpers'

const pressCtrlK = async () => {
  document.body.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'k', code: 'KeyK', ctrlKey: true, bubbles: true }),
  )
  await flushPromises()
}

const visibleOptions = () =>
  [...document.querySelectorAll<HTMLElement>('[data-slot="command-item"]')]
    .filter((item) => !item.hidden)
    .map((item) => item.textContent.trim())

afterEach(() => {
  localStorage.clear()
})

describe('the quick switcher', () => {
  const prompts = [
    makePrompt({ id: 'one', title: 'Write a poem', body: 'commit message' }),
    makePrompt({ id: 'two', title: 'Commit message' }),
  ]

  it('opens with Ctrl+K and lists the prompts', async () => {
    seed(prompts)
    await mountApp('/')
    await pressCtrlK()
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Open a prompt')
    expect(visibleOptions()).toStrictEqual(['Commit message', 'Write a poem'])
  })

  it('searches by title only and opens the chosen prompt in use mode', async () => {
    seed(prompts)
    const { router } = await mountApp('/')
    await pressCtrlK()
    const input = document.querySelector<HTMLInputElement>('[data-slot="command-input"]')
    await typeInto(input as HTMLInputElement, 'commit')
    expect(visibleOptions()).toStrictEqual(['Commit message'])
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/prompts/two')
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })
})
