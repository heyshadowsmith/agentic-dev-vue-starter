import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '../App.vue'
import type { Ledger } from '../core/ledger'
import { routes } from '../router'
import { storageKey } from '../stores/ledger-storage'

export const sampleLedger: Ledger = {
  people: [
    { id: 'p-alex', name: 'Alex' },
    { id: 'p-sam', name: 'Sam' },
  ],
  expenses: [
    {
      id: 'e-taxi',
      description: 'Taxi',
      amountCents: 2500,
      paidBy: 'p-sam',
      splitAmong: ['p-alex', 'p-sam'],
      createdAt: '2026-11-18T12:00:00.000Z',
    },
  ],
}

export function storeLedger(ledger: Ledger) {
  localStorage.setItem(storageKey, JSON.stringify(ledger))
}

export function storedLedger(): unknown {
  return JSON.parse(localStorage.getItem(storageKey) ?? 'null')
}

export async function mountApp(path = '/') {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  const wrapper = mount(App, {
    global: { plugins: [createPinia(), router] },
    attachTo: document.body,
  })
  await flushPromises()
  return { wrapper, router }
}
