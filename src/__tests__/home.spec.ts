import { describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { quickStart, templateUrl } from '../home/content'
import { mountApp } from './mount-app'

const stubClipboard = (writeText: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
}

describe('home page', () => {
  it('shows the title and the quick start commands', async () => {
    const wrapper = await mountApp()
    expect(wrapper.get('h1').text()).toBe('Every rule is a check.')
    expect(wrapper.get('[data-testid="quick-start"]').text()).toBe(quickStart)
  })

  it('links to the GitHub template', async () => {
    const wrapper = await mountApp()
    const link = wrapper.findAll('a').find((item) => item.text() === 'Use this template')
    expect(link?.attributes('href')).toBe(templateUrl)
    expect(templateUrl).toBe('https://github.com/heyshadowsmith/agentic-dev-vue-starter/generate')
  })

  it('sends an unknown path to the home page', async () => {
    const wrapper = await mountApp('/missing')
    expect(wrapper.find('h1').exists()).toBe(true)
  })

  it('copies the quick start commands', async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve())
    stubClipboard(writeText)
    const wrapper = await mountApp()
    const button = wrapper.findAll('button').find((item) => item.text() === 'Copy commands')
    await button?.trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith(quickStart)
    expect(document.body.textContent).toContain('Copied the commands')
  })

  it('says when the copy fails', async () => {
    stubClipboard(() => Promise.reject(new Error('Denied')))
    const wrapper = await mountApp()
    const button = wrapper.findAll('button').find((item) => item.text() === 'Copy commands')
    await button?.trigger('click')
    await flushPromises()
    expect(document.body.textContent).toContain('Could not copy the commands')
  })

  it('shows every CI step group with its time', async () => {
    const wrapper = await mountApp()
    const rows = wrapper
      .findAll('[data-slot="waterfall-row"][data-branch]')
      .map((row) => row.text())
    expect(rows).toStrictEqual([
      '▸ Set up19 s',
      '▸ Supply chain14 s',
      '▸ Style3 s',
      '▸ Code16 s',
      '▸ Build and test10 s',
    ])
  })
})
