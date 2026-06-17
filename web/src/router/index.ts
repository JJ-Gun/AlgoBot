import { createRouter, createWebHistory } from 'vue-router'
import UserLayout from '@/components/layout/UserLayout.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth/callback',
      component: () => import('@/pages/Callback.vue'),
    },
    {
      path: '/',
      component: UserLayout,
      children: [
        { path: '', component: () => import('@/pages/user/Home.vue') },
        { path: 'voice', component: () => import('@/pages/user/Voice.vue') },
        { path: 'inquiry', component: () => import('@/pages/user/Inquiry.vue') },
        { path: 'notice', component: () => import('@/pages/user/Notice.vue')},
      ],
    },
    {
      path: '/admin',
      component: AdminLayout,
      children: [
        { path: '', component: () => import('@/pages/admin/Dashboard.vue') },
        { path: 'status', component: () => import('@/pages/admin/Status.vue') },
        { path: 'logs', component: () => import('@/pages/admin/Logs.vue') },
        { path: 'inquiry', component: () => import('@/pages/admin/Inquiry.vue') },
        { path: 'notice', component: () => import('@/pages/admin/Notice.vue') },
      ],
    },
  ],
})

router.beforeEach((to) => {
  if (to.path.startsWith('/admin')) {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) {
      return '/'
    }
    if (!userStore.isAdmin) {
      return '/'
    }
  }
})

export default router