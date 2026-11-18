import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import BalancesView from '@/views/BalancesView.vue'
import SettleView from '@/views/SettleView.vue'

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'balances', component: BalancesView },
  { path: '/settle', name: 'settle', component: SettleView },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
