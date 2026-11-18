import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '../App.vue'
import { routes } from '../router'

export const mountApp = async (path = '/') => {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, {
    global: { plugins: [createPinia(), router] },
    attachTo: document.body,
  })
  await flushPromises()
  return { wrapper, router }
}

export const controlFor = (wrapper: VueWrapper, label: string) => {
  const labelElement = wrapper.findAll('label').find((element) => element.text() === label)
  return wrapper.get(`#${CSS.escape(labelElement?.attributes('for') ?? 'missing')}`)
}

export const buttonNamed = (wrapper: VueWrapper, name: string) => {
  const button = wrapper.findAll('button').find((element) => clean(element.text()) === name)
  return button ?? wrapper.get('#missing-button')
}

export const addPeople = async (wrapper: VueWrapper, names: readonly string[]) => {
  for (const name of names) {
    await controlFor(wrapper, 'Person name').setValue(name)
    await wrapper.get('form').trigger('submit')
  }
}

export const buttonNames = (wrapper: VueWrapper) =>
  wrapper.findAll('[data-slot="button"]').map((button) => clean(button.text()))

const clean = (text: string) => text.replaceAll(/\s+/g, ' ').trim()

const sectionNamed = (wrapper: VueWrapper, heading: string) =>
  wrapper.findAll('section').find((element) => element.get('h2').text() === heading)

export const textOf = (wrapper: VueWrapper, heading: string) =>
  clean(sectionNamed(wrapper, heading)?.text() ?? '')

export const itemsOf = (wrapper: VueWrapper, heading: string) =>
  (sectionNamed(wrapper, heading)?.findAll('li') ?? []).map((item) => clean(item.text()))
