import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Phase 00 ships a single placeholder route so the app boots. Real routes
// arrive in phase 02 (onboarding + home), phase 05 (gameplay), etc.
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Placeholder.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
