import { toast } from '@ui-sdk/vue/toast'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

const writeText = vi.fn<(text: string) => Promise<void>>()

Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

const prompt = makePrompt({
  id: 'p1',
  title: 'Translate',
  body: 'Translate {{ text }} into {{lang|French}}. Keep {{lang}} formal.',
})

const preview = () => document.querySelector('output')?.textContent ?? ''

afterEach(() => {
  localStorage.clear()
  toast.dismiss()
  writeText.mockReset()
})

describe('using a prompt', () => {
  it('shows one field per variable with its default', async () => {
    seed([prompt])
    await mountApp('/prompts/p1')
    expect(byLabel('text').value).toBe('')
    expect(byLabel('lang').value).toBe('French')
    expect(document.querySelectorAll('[data-slot="field"]')).toHaveLength(2)
  })

  it('updates the preview as you type', async () => {
    seed([prompt])
    await mountApp('/prompts/p1')
    expect(preview()).toBe('Translate  into French. Keep French formal.')
    await typeInto(byLabel('text'), 'hello')
    await typeInto(byLabel('lang'), 'German')
    expect(preview()).toBe('Translate hello into German. Keep German formal.')
  })

  it('resets the values to the defaults', async () => {
    seed([prompt])
    await mountApp('/prompts/p1')
    await typeInto(byLabel('lang'), 'German')
    await click(buttonNamed('Reset to defaults'))
    expect(preview()).toBe('Translate  into French. Keep French formal.')
  })

  it('copies the result, confirms it and records the use', async () => {
    writeText.mockResolvedValue()
    seed([prompt])
    await mountApp('/prompts/p1')
    await typeInto(byLabel('text'), 'hi')
    await click(buttonNamed('Copy to clipboard'))
    expect(writeText).toHaveBeenCalledWith('Translate hi into French. Keep French formal.')
    expect(pageText()).toContain('Copied to the clipboard')
    expect(storedPrompts()[0]?.useCount).toBe(1)
    expect(storedPrompts()[0]?.lastUsedAt).toBeTypeOf('number')
    expect(pageText()).toContain('Used once')
  })

  it('explains a failed copy and does not count a use', async () => {
    writeText.mockRejectedValue(new Error('denied'))
    seed([prompt])
    await mountApp('/prompts/p1')
    await click(buttonNamed('Copy to clipboard'))
    expect(pageText()).toContain('Could not copy the prompt')
    expect(storedPrompts()[0]?.useCount).toBe(0)
  })

  it('says when a prompt has no variables', async () => {
    seed([makePrompt({ id: 'plain', body: 'Just text' })])
    await mountApp('/prompts/plain')
    expect(pageText()).toContain('This prompt has no variables.')
    expect(preview()).toBe('Just text')
  })

  it('shows not found with a link back for an unknown id', async () => {
    await mountApp('/prompts/missing')
    expect(pageText()).toContain('No prompt has this ID.')
    expect(document.querySelector('main a[href="/"]')?.textContent).toBe('Back to all prompts')
  })

  it('goes back to the list after a delete', async () => {
    seed([prompt])
    const { router } = await mountApp('/prompts/p1')
    await click(buttonNamed('Delete Translate'))
    await click(
      document.querySelector<HTMLElement>(
        '[data-slot="alert-dialog-close"][data-variant="destructive"]',
      ) as HTMLElement,
    )
    expect(router.currentRoute.value.name).toBe('list')
    expect(storedPrompts()).toStrictEqual([])
  })
})
