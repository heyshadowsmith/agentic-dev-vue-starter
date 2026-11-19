import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { failure } from '@/core/result'
import { mountApp } from './mount-app'
import { withFakes } from './fakes'

describe('repository data', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('loads the repository once for the header and the footer', async () => {
    const fakes = withFakes()
    await mountApp('/', [fakes.plugin])
    expect(fakes.source.requests).toStrictEqual(['heyshadowsmith/agentic-dev-vue-starter'])
  })

  it('shows the star count on the GitHub link', async () => {
    const wrapper = await mountApp('/', [withFakes().plugin])
    const link = wrapper.findAll('header a').find((item) => item.text().startsWith('GitHub'))
    expect(link?.text().replaceAll(/\s+/g, ' ')).toBe('GitHub ★ 42 stars')
  })

  it('shows the activity in the footer', async () => {
    vi.useFakeTimers({ toFake: ['Date'], now: Date.UTC(2026, 10, 21, 12) })
    const wrapper = await mountApp('/', [withFakes().plugin])
    expect(wrapper.findAll('footer li').map((item) => item.text())).toStrictEqual([
      'Last push 2 days ago',
      '7 forks',
      '4 open pull requests',
      '0 open issues',
    ])
  })

  it('shows no star count and offers Try again when the request fails', async () => {
    const fakes = withFakes(failure('GitHub answered 403.'))
    const wrapper = await mountApp('/', [fakes.plugin])
    expect(wrapper.find('[data-testid="star-count"]').exists()).toBe(false)
    expect(wrapper.get('footer').text()).toContain('GitHub answered 403.')
    const retry = wrapper.findAll('footer button').find((button) => button.text() === 'Try again')
    await retry?.trigger('click')
    await flushPromises()
    expect(fakes.source.requests).toHaveLength(2)
  })
})
