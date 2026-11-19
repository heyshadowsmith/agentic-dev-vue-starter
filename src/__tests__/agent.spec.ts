import { flushPromises } from '@vue/test-utils'
import { createAgent } from '@ui-sdk/vue/agent'
import { toast } from '@ui-sdk/vue/toast'
import { afterEach, describe, expect, it } from 'vitest'
import { byLabel, makePrompt, mountApp, seed } from './helpers'

const agent = createAgent()

const namedEntries = () =>
  agent.snapshot().filter((entry) => !entry.offPage && entry.component !== 'more')

afterEach(() => {
  localStorage.clear()
  toast.dismiss()
})

describe('an agent', () => {
  it('can find and use every control on the list', async () => {
    seed([
      makePrompt({ id: 'a', title: 'Alpha', tags: ['dev'] }),
      makePrompt({ id: 'b', title: 'Beta', tags: ['fun'] }),
    ])
    await mountApp('/')
    const entries = namedEntries()
    for (const entry of entries) {
      expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy()
    }
    const labels = entries.map((entry) => entry.label)
    for (const label of ['Search', 'Sort by', 'Filter by tag', 'Pin Alpha', 'Find a prompt']) {
      expect(labels, `${label} is missing from the snapshot`).toContain(label)
    }
    const result = await agent.act({
      steps: [
        { ref: 'Search', action: 'setValue', args: ['alp'] },
        { ref: 'Sort by', action: 'setValue', args: ['Title'] },
      ],
    })
    await flushPromises()
    expect(result.ok, result.error?.message).toBe(true)
    expect(byLabel('Search').value).toBe('alp')
    expect(document.querySelectorAll('article')).toHaveLength(1)
  })

  it('can fill the variables of a prompt', async () => {
    seed([makePrompt({ id: 'p', title: 'Greet', body: 'Hi {{name}}' })])
    await mountApp('/prompts/p')
    const labels = namedEntries().map((entry) => entry.label)
    expect(labels).toContain('name')
    expect(labels).toContain('Copy to clipboard')
    const result = await agent.act({ steps: [{ ref: 'name', action: 'setValue', args: ['Ada'] }] })
    await flushPromises()
    expect(result.ok, result.error?.message).toBe(true)
    expect(document.querySelector('output')?.textContent).toBe('Hi Ada')
  })
})
