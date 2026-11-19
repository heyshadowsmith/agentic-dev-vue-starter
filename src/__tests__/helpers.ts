import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { Prompt } from '@/core/prompts'
import { routes } from '@/router'
import { storageKey } from '@/lib/storage'
import App from '@/App.vue'

export const makePrompt = (overrides: Partial<Prompt> & { id: string }): Prompt => ({
  title: `Prompt ${overrides.id}`,
  body: 'Text',
  tags: [],
  createdAt: 1000,
  updatedAt: 1000,
  pinned: false,
  useCount: 0,
  lastUsedAt: null,
  ...overrides,
})

export const seed = (prompts: readonly Prompt[]) => {
  localStorage.setItem(storageKey, JSON.stringify({ version: 1, prompts }))
}

export const storedPrompts = (): Prompt[] => {
  const raw = localStorage.getItem(storageKey) ?? '{"prompts":[]}'
  return (JSON.parse(raw) as { prompts: Prompt[] }).prompts
}

export const mountApp = async (path: string) => {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  const wrapper = mount(App, {
    attachTo: document.body,
    global: { plugins: [createPinia(), router] },
  })
  await flushPromises()
  return { wrapper, router }
}

export const byLabel = (label: string): HTMLInputElement => {
  const element = [...document.querySelectorAll<HTMLLabelElement>('label')].find(
    (candidate) => candidate.textContent.trim() === label,
  )
  const control = element?.control
  if (control === null || control === undefined) throw new Error(`No control named ${label}`)
  return control as HTMLInputElement
}

export const buttonNamed = (name: string): HTMLButtonElement => {
  const button = [...document.querySelectorAll('button')].find(
    (candidate) =>
      candidate.getAttribute('aria-label') === name || candidate.textContent.trim() === name,
  )
  if (button === undefined) throw new Error(`No button named ${name}`)
  return button
}

export const typeInto = async (element: HTMLInputElement | HTMLTextAreaElement, text: string) => {
  element.value = text
  element.dispatchEvent(new Event('input', { bubbles: true }))
  await flushPromises()
}

export const click = async (element: HTMLElement) => {
  element.click()
  await flushPromises()
}

export const pageText = () => document.body.textContent.replaceAll(/\s+/g, ' ')
