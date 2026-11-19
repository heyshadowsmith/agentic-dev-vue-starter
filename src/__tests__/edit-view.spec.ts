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

afterEach(() => {
  localStorage.clear()
  toast.dismiss()
})

describe('creating a prompt', () => {
  it('asks for a title and a body', async () => {
    await mountApp('/new')
    await click(buttonNamed('Create prompt'))
    expect(pageText()).toContain('Enter a title.')
    expect(pageText()).toContain('Enter the prompt text.')
    expect(storedPrompts()).toStrictEqual([])
  })

  it('lists the variables it finds', async () => {
    await mountApp('/new')
    await typeInto(byLabel('Prompt'), 'Hi {{name}}, about {{topic|news}} and {{name}}')
    expect(pageText()).toContain('Variables: name, topic (default: news)')
  })

  it('saves the prompt and opens it for use', async () => {
    const { router } = await mountApp('/new')
    await typeInto(byLabel('Title'), '  Greeting ')
    await typeInto(byLabel('Prompt'), 'Hello {{name}}')
    await typeInto(byLabel('Tags'), 'Social, fun, social')
    await click(buttonNamed('Create prompt'))
    const [saved] = storedPrompts()
    expect(saved?.title).toBe('Greeting')
    expect(saved?.tags).toStrictEqual(['social', 'fun'])
    expect(router.currentRoute.value.fullPath).toBe(`/prompts/${saved?.id ?? ''}`)
  })

  it('goes back to the list on cancel', async () => {
    const { router } = await mountApp('/new')
    await click(buttonNamed('Cancel'))
    expect(router.currentRoute.value.name).toBe('list')
  })
})

describe('editing a prompt', () => {
  const prompt = makePrompt({ id: 'e1', title: 'Old', body: 'Body', tags: ['a', 'b'], useCount: 4 })

  it('fills the form with the prompt', async () => {
    seed([prompt])
    await mountApp('/prompts/e1/edit')
    expect(byLabel('Title').value).toBe('Old')
    expect(byLabel('Prompt').value).toBe('Body')
    expect(byLabel('Tags').value).toBe('a, b')
  })

  it('saves the changes and keeps the use history', async () => {
    seed([prompt])
    const { router } = await mountApp('/prompts/e1/edit')
    await typeInto(byLabel('Title'), 'New')
    await click(buttonNamed('Save changes'))
    expect(storedPrompts()[0]?.title).toBe('New')
    expect(storedPrompts()[0]?.useCount).toBe(4)
    expect(router.currentRoute.value.fullPath).toBe('/prompts/e1')
  })

  it('goes back to the prompt on cancel', async () => {
    seed([prompt])
    const { router } = await mountApp('/prompts/e1/edit')
    await click(buttonNamed('Cancel'))
    expect(router.currentRoute.value.fullPath).toBe('/prompts/e1')
  })

  it('shows not found for an unknown id', async () => {
    await mountApp('/prompts/nope/edit')
    expect(pageText()).toContain('No prompt has this ID.')
    expect(document.querySelector('main a[href="/"]')).not.toBeNull()
  })
})

describe('an unknown page', () => {
  it('shows not found with a link to the list', async () => {
    await mountApp('/some/where')
    expect(pageText()).toContain('This page does not exist.')
    expect(document.querySelector('main a[href="/"]')?.textContent).toBe('Back to all prompts')
  })
})

describe('the syntax help', () => {
  it('shows the variable syntax exactly', async () => {
    await mountApp('/new')
    expect(pageText()).toContain(
      'Write variables as {{name}}. Add a default value with {{name|default text}}.',
    )
  })
})
