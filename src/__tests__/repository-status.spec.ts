import { describe, expect, it } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { failure } from '@/core/result'
import { mountApp } from './mount-app'
import { withFakes } from './fakes'

const panelText = (wrapper: Awaited<ReturnType<typeof mountApp>>) =>
  wrapper.get('section[aria-labelledby="live-title"]').text()

describe('live repository panel', () => {
  it('asks the source for this repository and shows its counts', async () => {
    const fakes = withFakes()
    const wrapper = await mountApp('/', [fakes.plugin])
    expect(fakes.source.requests).toStrictEqual(['heyshadowsmith/agentic-dev-vue-starter'])
    expect(panelText(wrapper)).toContain('Stars42')
    expect(panelText(wrapper)).toContain('Open issues3')
  })

  it('shows the error and loads again on Try again', async () => {
    const fakes = withFakes(failure('GitHub answered 403.'))
    const wrapper = await mountApp('/', [fakes.plugin])
    expect(panelText(wrapper)).toContain('GitHub answered 403.')
    const retry = wrapper.findAll('button').find((button) => button.text() === 'Try again')
    await retry?.trigger('click')
    await flushPromises()
    expect(fakes.source.requests).toHaveLength(2)
  })
})
