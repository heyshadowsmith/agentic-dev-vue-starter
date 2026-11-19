import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import PromptListView from '@/views/PromptListView.vue'
import PromptEditView from '@/views/PromptEditView.vue'
import PromptUseView from '@/views/PromptUseView.vue'
import NotFound from '@/components/NotFound.vue'

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'list', component: PromptListView },
  { path: '/new', name: 'new', component: PromptEditView },
  { path: '/prompts/:id/edit', name: 'edit', component: PromptEditView, props: true },
  { path: '/prompts/:id', name: 'use', component: PromptUseView, props: true },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
    props: { message: 'This page does not exist.' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
