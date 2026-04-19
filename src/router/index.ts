import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Phase 01 adds the dev-only /gallery route so every DS component can be
// inspected in isolation. Real routes (onboarding, home, play, etc.)
// arrive in phase 02+.
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Placeholder.vue'),
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: () => import('@/views/Gallery.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
