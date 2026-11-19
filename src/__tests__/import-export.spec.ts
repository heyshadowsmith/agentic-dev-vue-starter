import { flushPromises } from '@vue/test-utils'
import { toast } from '@ui-sdk/vue/toast'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buttonNamed, click, makePrompt, mountApp, pageText, seed, storedPrompts } from './helpers'

const existing = makePrompt({ id: 'keep', title: 'Existing' })

const chooseFile = async (content: string, name = 'prompts.json') => {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]') as HTMLInputElement
  const file = new File([content], name, { type: 'application/json' })
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  input.dispatchEvent(new Event('change', { bubbles: true }))
  await flushPromises()
  await flushPromises()
}

const importButton = () =>
  document.querySelector<HTMLButtonElement>(
    '[data-slot="alert-dialog-close"][data-variant="solid"]',
  ) as HTMLButtonElement

afterEach(() => {
  localStorage.clear()
  toast.dismiss()
  vi.restoreAllMocks()
})

describe('importing prompts', () => {
  const file = JSON.stringify({
    version: 1,
    prompts: [
      { ...existing, title: 'Changed' },
      makePrompt({ id: 'new1', title: 'New one' }),
      makePrompt({ id: 'new2', title: 'New two' }),
    ],
  })

  it('shows how many prompts will be added and skipped', async () => {
    seed([existing])
    await mountApp('/')
    await chooseFile(file)
    expect(pageText()).toContain('2 prompts will be added. 1 prompt will be skipped')
    expect(storedPrompts()).toHaveLength(1)
  })

  it('adds the new prompts after confirmation and keeps the existing one', async () => {
    seed([existing])
    await mountApp('/')
    await chooseFile(file)
    await click(importButton())
    expect(storedPrompts().map((prompt) => prompt.title)).toStrictEqual([
      'Existing',
      'New one',
      'New two',
    ])
    expect(pageText()).toContain('Imported 2 prompts')
  })

  it('changes nothing when the import is cancelled', async () => {
    seed([existing])
    await mountApp('/')
    await chooseFile(file)
    await click(buttonNamed('Cancel'))
    expect(storedPrompts()).toStrictEqual([existing])
  })

  it('cannot confirm when every prompt is a duplicate', async () => {
    seed([existing])
    await mountApp('/')
    await chooseFile(JSON.stringify([existing]))
    expect(pageText()).toContain('0 prompts will be added. 1 prompt will be skipped')
    expect(importButton().disabled).toBe(true)
  })

  it('rejects a file that is not JSON without changing the data', async () => {
    seed([existing])
    await mountApp('/')
    await chooseFile('{oops')
    expect(pageText()).toContain('The file is not valid JSON.')
    expect(document.querySelector('[role="alertdialog"]')).toBeNull()
    expect(storedPrompts()).toStrictEqual([existing])
  })

  it('rejects a file with a bad prompt without changing the data', async () => {
    seed([existing])
    await mountApp('/')
    await chooseFile(JSON.stringify({ prompts: [makePrompt({ id: 'x' }), { id: 'y' }] }))
    expect(pageText()).toContain('Prompt 2 needs a text "title".')
    expect(storedPrompts()).toStrictEqual([existing])
  })
})

describe('exporting prompts', () => {
  it('downloads every prompt as a JSON file', async () => {
    seed([existing])
    const createObjectURL = vi.fn<(blob: Blob) => string>().mockReturnValue('blob:prompts')
    const revokeObjectURL = vi.fn<(url: string) => void>()
    Object.assign(URL, { createObjectURL, revokeObjectURL })
    const clicked = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockReturnValue()
    await mountApp('/')
    await click(buttonNamed('Export'))
    const anchor = clicked.mock.contexts[0] as HTMLAnchorElement
    expect(anchor.download).toMatch(/^prompt-library-\d{4}-\d{2}-\d{2}\.json$/)
    const blob = createObjectURL.mock.calls[0]?.[0] as Blob
    expect(JSON.parse(await blob.text())).toStrictEqual({ version: 1, prompts: [existing] })
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:prompts')
  })
})
