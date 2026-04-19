import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useProfileStore } from '@/stores/profile'

// Route inventory is seeded across phases 02–07. Every route is defined
// up front; screens that land later still resolve via a ComingSoon stub.
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('@/views/Onboarding.vue'),
    meta: { allowUnboarded: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Profile.vue'),
  },
  {
    path: '/profile/acknowledgements',
    name: 'acknowledgements',
    component: () => import('@/views/Acknowledgements.vue'),
  },
  {
    path: '/play/setup',
    name: 'play-setup',
    component: () => import('@/views/PlaySetup.vue'),
  },
  {
    path: '/play/live',
    name: 'play-live',
    component: () => import('@/views/PlayLive.vue'),
  },
  {
    path: '/play/over',
    name: 'play-over',
    component: () => import('@/views/PlayOver.vue'),
  },
  {
    path: '/stats',
    name: 'stats',
    component: () => import('@/views/Stats.vue'),
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: () => import('@/views/Gallery.vue'),
    meta: { allowUnboarded: true },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Gate every non-onboarding route behind profile existence. The profile
// store loads here on first navigation.
router.beforeEach(async (to) => {
  const profileStore = useProfileStore()
  if (!profileStore.loaded) {
    await profileStore.load()
  }
  const allow = to.meta.allowUnboarded === true
  if (!profileStore.isOnboarded && !allow) {
    return { name: 'onboarding' }
  }
  if (profileStore.isOnboarded && to.name === 'onboarding') {
    return { name: 'home' }
  }
  return true
})
