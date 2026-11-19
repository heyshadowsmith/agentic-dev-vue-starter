import { flushPromises } from '@vue/test-utils'
import { toast } from '@ui-sdk/vue/toast'
import { afterEach, describe, expect, it } from 'vitest'
import {
  buttonNamed,
  byLabel,
  click,
  makePrompt,
  mountApp,
  pageText,
  seed,
  storedPrompts,
  typeInto,
} from './helpers'

const titles = () =>
  [...document.querySelectorAll('article h2')].map((heading) => heading.textContent.trim())

const library = [
  makePrompt({
    id: 'a',
    title: 'Email reply',
    tags: ['email', 'work'],
    useCount: 1,
    lastUsedAt: 10,
  }),
  makePrompt({
    id: 'b',
    title: 'Bug report',
    body: 'Steps for {{bug}}',
    tags: ['dev'],
    useCount: 5,
    lastUsedAt: 5,
  }),
  makePrompt({ id: 'c', title: 'Cover letter', tags: ['work'] }),
]

afterEach(() => {
  localStorage.clear()
  toast.dismiss()
})

describe('the prompt list', () => {
  it('shows an empty state with a link to create a prompt', async () => {
    await mountApp('/')
    expect(pageText()).toContain('No prompts yet')
    expect(document.querySelector('a[href="/new"]')?.textContent).toContain('New prompt')
  })

  it('lists prompts by most recent use', async () => {
    seed(library)
    await mountApp('/')
    expect(titles()).toStrictEqual(['Email reply', 'Bug report', 'Cover letter'])
  })

  it('searches the title, the body and the tags as you type', async () => {
    seed(library)
    await mountApp('/')
    await typeInto(byLabel('Search'), 'bug')
    expect(titles()).toStrictEqual(['Bug report'])
    await typeInto(byLabel('Search'), 'steps')
    expect(titles()).toStrictEqual(['Bug report'])
    await typeInto(byLabel('Search'), 'work')
    expect(titles()).toStrictEqual(['Email reply', 'Cover letter'])
  })

  it('shows a way out when nothing matches', async () => {
    seed(library)
    await mountApp('/')
    await typeInto(byLabel('Search'), 'zzz')
    expect(pageText()).toContain('0 of 3 prompts')
    await click(buttonNamed('Clear search and tags'))
    expect(titles()).toHaveLength(3)
  })

  it('filters by one or more tags', async () => {
    seed(library)
    await mountApp('/')
    await click(buttonNamed('work'))
    expect(titles()).toStrictEqual(['Email reply', 'Cover letter'])
    await click(buttonNamed('email'))
    expect(titles()).toStrictEqual(['Email reply'])
    expect(buttonNamed('email').getAttribute('aria-pressed')).toBe('true')
  })

  it('sorts by use count and by title', async () => {
    seed(library)
    await mountApp('/')
    await click(document.querySelector<HTMLElement>('[data-slot="select-trigger"]') as HTMLElement)
    const option = (label: string) =>
      [...document.querySelectorAll<HTMLElement>('[data-slot="select-item"]')].find((item) =>
        item.textContent.includes(label),
      ) as HTMLElement
    await click(option('Most used'))
    expect(titles()).toStrictEqual(['Bug report', 'Email reply', 'Cover letter'])
    await click(document.querySelector<HTMLElement>('[data-slot="select-trigger"]') as HTMLElement)
    await click(option('Title'))
    expect(titles()).toStrictEqual(['Bug report', 'Cover letter', 'Email reply'])
  })

  it('keeps a pinned prompt first and saves the pin', async () => {
    seed(library)
    await mountApp('/')
    await click(buttonNamed('Pin Cover letter'))
    expect(titles()[0]).toBe('Cover letter')
    expect(buttonNamed('Pin Cover letter').getAttribute('aria-pressed')).toBe('true')
    expect(storedPrompts().find((prompt) => prompt.id === 'c')?.pinned).toBe(true)
  })

  it('keeps the prompt when the delete is cancelled', async () => {
    seed(library)
    await mountApp('/')
    await click(buttonNamed('Delete Cover letter'))
    expect(pageText()).toContain('Delete “Cover letter”?')
    await click(buttonNamed('Cancel'))
    expect(titles()).toHaveLength(3)
    expect(storedPrompts()).toHaveLength(3)
  })

  it('deletes a prompt after confirmation', async () => {
    seed(library)
    await mountApp('/')
    await click(buttonNamed('Delete Cover letter'))
    const confirm = document.querySelector<HTMLElement>(
      '[data-slot="alert-dialog-close"][data-variant="destructive"]',
    ) as HTMLElement
    await click(confirm)
    await flushPromises()
    expect(titles()).toStrictEqual(['Email reply', 'Bug report'])
    expect(storedPrompts().map((prompt) => prompt.id)).toStrictEqual(['a', 'b'])
  })

  it('duplicates a prompt and opens the copy for editing', async () => {
    seed(library)
    const { router } = await mountApp('/')
    await click(buttonNamed('Duplicate Bug report'))
    await flushPromises()
    const copy = storedPrompts().find((prompt) => prompt.title === 'Bug report (copy)')
    expect(copy?.body).toBe('Steps for {{bug}}')
    expect(router.currentRoute.value.fullPath).toBe(`/prompts/${copy?.id ?? ''}/edit`)
  })
})
