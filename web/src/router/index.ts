import { createRouter, createWebHistory } from 'vue-router'
import UserLayout from '@/components/layout/UserLayout.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: UserLayout,
      children: [
        { path: '', component: () => import('@/pages/user/Home.vue') },
        { path: 'voice', component: () => import('@/pages/user/Voice.vue') },
        { path: 'settings', component: () => import('@/pages/user/Settings.vue') },
        { path: 'inquiry', component: () => import('@/pages/user/Inquiry.vue') },
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

export default router