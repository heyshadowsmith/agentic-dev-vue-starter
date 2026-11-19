import { flushPromises, mount } from '@vue/test-utils'
import type { Plugin } from 'vue'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '../App.vue'
import { routes } from '../router'

export const mountApp = async (path = '/', plugins: readonly Plugin[] = []) => {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, {
    global: { plugins: [router, createPinia(), ...plugins] },
    attachTo: document.body,
  })
  await flushPromises()
  return wrapper
}
