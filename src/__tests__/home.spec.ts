import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createAgent } from '@ui-sdk/vue/agent'
import App from '../App.vue'
import { routes } from '../router'
import { ciChecks, commitChecks, quickStart } from '../home/content'

const agent = createAgent()

const mountApp = async (path = '/') => {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  await router.isReady()
  return mount(App, { global: { plugins: [router] }, attachTo: document.body })
}

const stubClipboard = (writeText: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
}

describe('home page', () => {
  it('shows the title and the quick start commands', async () => {
    const wrapper = await mountApp()
    expect(wrapper.get('h1').text()).toBe('A strict Vue starter for coding agents')
    expect(wrapper.get('[data-testid="quick-start"]').text()).toBe(quickStart)
  })

  it('sends an unknown path to the home page', async () => {
    const wrapper = await mountApp('/missing')
    expect(wrapper.find('h1').exists()).toBe(true)
  })

  it('lists the commit checks first', async () => {
    const wrapper = await mountApp()
    const text = wrapper.text()
    expect(commitChecks.every((check) => text.includes(check.tool))).toBe(true)
  })

  it('copies the quick start commands', async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve())
    stubClipboard(writeText)
    const wrapper = await mountApp()
    await wrapper.get('button[data-slot="button"]').trigger('click')
    await flushPromises()
    expect(writeText).toHaveBeenCalledWith(quickStart)
    expect(document.body.textContent).toContain('Copied the commands')
  })

  it('says when the copy fails', async () => {
    stubClipboard(() => Promise.reject(new Error('Denied')))
    const wrapper = await mountApp()
    await wrapper.get('button[data-slot="button"]').trigger('click')
    await flushPromises()
    expect(document.body.textContent).toContain('Could not copy the commands')
  })

  it('lets an agent find every control and switch to the CI checks', async () => {
    const wrapper = await mountApp()
    const components = agent
      .snapshot()
      .filter((entry) => !entry.offPage && entry.component !== 'more')
    const labels = components.map((entry) => entry.label)
    expect(labels.every(Boolean), JSON.stringify(components)).toBe(true)
    expect(labels).toStrictEqual(expect.arrayContaining(['Copy commands', 'When checks run']))

    const result = await agent.act({
      steps: [{ ref: 'When checks run', action: 'setValue', args: ['In CI'] }],
    })
    await flushPromises()
    expect(result.ok, result.error?.message).toBe(true)
    const panel = wrapper.get('[data-slot="tabs-panel"]:not([hidden])')
    expect(ciChecks.every((check) => panel.text().includes(check.tool))).toBe(true)
  })
})
