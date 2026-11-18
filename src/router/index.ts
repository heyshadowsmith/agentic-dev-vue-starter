import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import BalancesView from '@/views/BalancesView.vue'

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'balances', component: BalancesView },
  { path: '/settle', name: 'settle', component: () => import('@/views/SettleView.vue') },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
