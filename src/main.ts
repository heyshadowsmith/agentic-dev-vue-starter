import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { createGithubClient } from './adapters/github/client'
import { repositorySourceKey } from './ports/repository-source'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.provide(repositorySourceKey, createGithubClient())

app.mount('#app')
