import { describe, expect, it, vi } from 'vitest'
import { createGithubClient } from '../client'

const body = {
  full_name: 'owner/name',
  stargazers_count: 12,
  forks_count: 3,
  open_issues_count: 1,
  pushed_at: '2026-11-19T12:00:00Z',
  unused_field: true,
}

const respond = (response: Response) =>
  vi.fn<(input: string, init?: RequestInit) => Promise<Response>>(() => Promise.resolve(response))

describe('createGithubClient', () => {
  it('maps the response to a repository', async () => {
    const fetch = respond(Response.json(body))
    const client = createGithubClient({ fetch, baseUrl: 'https://example.test' })
    expect(await client.getRepository('owner/name')).toStrictEqual({
      ok: true,
      value: {
        fullName: 'owner/name',
        stars: 12,
        forks: 3,
        openIssues: 1,
        pushedAt: Date.UTC(2026, 10, 19, 12),
      },
    })
    expect(fetch.mock.calls[0]?.[0]).toBe('https://example.test/repos/owner/name')
  })

  it('reports an error status', async () => {
    const client = createGithubClient({ fetch: respond(new Response('', { status: 404 })) })
    expect(await client.getRepository('owner/missing')).toStrictEqual({
      ok: false,
      error: 'GitHub answered 404.',
    })
  })

  it('names the field that does not match the schema', async () => {
    const fetch = respond(Response.json({ ...body, stargazers_count: 'many' }))
    const result = await createGithubClient({ fetch }).getRepository('owner/name')
    expect(result).toStrictEqual({
      ok: false,
      error:
        'GitHub sent an unexpected response: stargazers_count: Invalid type: Expected number but received "many"',
    })
  })

  it('reports a body that is not JSON', async () => {
    const fetch = respond(new Response('<html>', { status: 200 }))
    const result = await createGithubClient({ fetch }).getRepository('owner/name')
    expect(result).toStrictEqual({
      ok: false,
      error:
        'GitHub sent an unexpected response: response: Invalid type: Expected Object but received undefined',
    })
  })

  it('reports a network failure', async () => {
    const fetch = vi.fn<(input: string, init?: RequestInit) => Promise<Response>>(() =>
      Promise.reject(new TypeError('Failed to fetch')),
    )
    expect(await createGithubClient({ fetch }).getRepository('owner/name')).toStrictEqual({
      ok: false,
      error: 'Could not reach GitHub.',
    })
  })
})
