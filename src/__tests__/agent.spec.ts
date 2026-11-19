import { describe, expect, it } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createAgent } from '@ui-sdk/vue/agent'
import { mountApp } from './mount-app'

const agent = createAgent()

const visibleLabels = () =>
  agent
    .snapshot()
    .filter((entry) => !entry.offPage && entry.component !== 'more')
    .map((entry) => entry.label)

describe('agent access', () => {
  it('gives every control a name', async () => {
    await mountApp()
    const labels = visibleLabels()
    expect(
      labels.filter((label) => !label),
      'unnamed components',
    ).toStrictEqual([])
    expect(labels).toStrictEqual(
      expect.arrayContaining([
        'Use this template',
        'Color scheme',
        'Task',
        'Change type',
        'Copy prompt',
        'Filter checks',
        'Runs',
        'CI run steps',
        'Project files',
      ]),
    )
  })

  it('fills the prompt form', async () => {
    const wrapper = await mountApp()
    const result = await agent.act({
      steps: [
        { ref: 'Task', action: 'setValue', args: ['The total is wrong.'] },
        { ref: 'Change type', action: 'setValue', args: ['fix'] },
        { ref: 'Open a pull request at the end', action: 'setChecked', args: [true] },
      ],
    })
    await flushPromises()
    expect(result.ok, result.error?.message).toBe(true)
    const output = wrapper.get('[data-testid="prompt-output"]').text()
    expect(output).toContain('Fix this bug: The total is wrong.')
    expect(output).toContain('Open a pull request when every check passes.')
  })

  it('filters the checks', async () => {
    const wrapper = await mountApp()
    const result = await agent.act({
      steps: [
        { ref: 'Runs', action: 'setValue', args: ['CI 4'] },
        { ref: 'Filter checks', action: 'setValue', args: ['coverage'] },
      ],
    })
    await flushPromises()
    expect(result.ok, result.error?.message).toBe(true)
    expect(wrapper.text()).toContain('Showing 1 of 10')
  })

  it('switches the color scheme', async () => {
    await mountApp()
    const result = await agent.act({
      steps: [{ ref: 'Color scheme', action: 'setValue', args: ['dark'] }],
    })
    await flushPromises()
    expect(result.ok, result.error?.message).toBe(true)
    expect(document.documentElement.dataset['colorScheme']).toBe('dark')
  })

  it('selects a path in the project map', async () => {
    const wrapper = await mountApp()
    const result = await agent.act({
      steps: [{ ref: 'Project files', action: 'setValue', args: ['AGENTS.md'] }],
    })
    await flushPromises()
    expect(result.ok, result.error?.message).toBe(true)
    expect(wrapper.text()).toContain('The rules an agent reads first.')
  })
})
