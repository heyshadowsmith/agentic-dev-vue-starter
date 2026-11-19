import { describe, expect, it, vi } from 'vitest'
import { createGithubClient } from '../client'

const repositoryBody = {
  full_name: 'owner/name',
  stargazers_count: 12,
  forks_count: 3,
  open_issues_count: 4,
  pushed_at: '2026-11-19T12:00:00Z',
}

const issueSearch = '/search/issues?per_page=1&q=repo%3Aowner%2Fname+type%3Aissue+state%3Aopen'
const pullSearch = '/search/issues?per_page=1&q=repo%3Aowner%2Fname+type%3Apr+state%3Aopen'

const github = (routes: Record<string, () => Response>) =>
  vi.fn<(input: string, init?: RequestInit) => Promise<Response>>((input) => {
    const path = input.replace('https://example.test', '')
    return Promise.resolve(routes[path]?.() ?? new Response('', { status: 404 }))
  })

const healthyRoutes = {
  '/repos/owner/name': () => Response.json(repositoryBody),
  [issueSearch]: () => Response.json({ total_count: 0, items: [] }),
  [pullSearch]: () => Response.json({ total_count: 4, items: [] }),
}

const client = (routes: Record<string, () => Response>) =>
  createGithubClient({ fetch: github(routes), baseUrl: 'https://example.test' })

describe('createGithubClient', () => {
  it('counts issues and pull requests apart, not from open_issues_count', async () => {
    expect(await client(healthyRoutes).getRepository('owner/name')).toStrictEqual({
      ok: true,
      value: {
        fullName: 'owner/name',
        stars: 12,
        forks: 3,
        pushedAt: Date.UTC(2026, 10, 19, 12),
        openIssues: 0,
        openPullRequests: 4,
      },
    })
  })

  it('sends three requests', async () => {
    const fetch = github(healthyRoutes)
    await createGithubClient({ fetch, baseUrl: 'https://example.test' }).getRepository('owner/name')
    expect(
      fetch.mock.calls.map(([input]) => input.replace('https://example.test', '')),
    ).toStrictEqual(['/repos/owner/name', issueSearch, pullSearch])
  })

  it('reports an error status from the repository request', async () => {
    expect(await client({}).getRepository('owner/missing')).toStrictEqual({
      ok: false,
      error: 'GitHub answered 404.',
    })
  })

  it('reports an error status from a search request', async () => {
    const routes = { ...healthyRoutes, [pullSearch]: () => new Response('', { status: 403 }) }
    expect(await client(routes).getRepository('owner/name')).toStrictEqual({
      ok: false,
      error: 'GitHub answered 403.',
    })
  })

  it('reports an issue search that does not match the schema', async () => {
    const routes = { ...healthyRoutes, [issueSearch]: () => Response.json({ items: [] }) }
    expect(await client(routes).getRepository('owner/name')).toStrictEqual({
      ok: false,
      error:
        'GitHub sent an unexpected response: total_count: Invalid key: Expected "total_count" but received undefined',
    })
  })

  it('names the repository field that does not match the schema', async () => {
    const routes = {
      ...healthyRoutes,
      '/repos/owner/name': () => Response.json({ ...repositoryBody, stargazers_count: 'many' }),
    }
    expect(await client(routes).getRepository('owner/name')).toStrictEqual({
      ok: false,
      error:
        'GitHub sent an unexpected response: stargazers_count: Invalid type: Expected number but received "many"',
    })
  })

  it('reports a body that is not JSON', async () => {
    const routes = { ...healthyRoutes, '/repos/owner/name': () => new Response('<html>') }
    expect(await client(routes).getRepository('owner/name')).toStrictEqual({
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
