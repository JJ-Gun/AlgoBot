import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: string
  username: string
  avatar: string | null
  isAdmin: boolean
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.isAdmin ?? false)

  async function fetchUser() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`,
        {
          credentials: 'include'
        })
      if (!res.ok) throw new Error('인증 실패')
      const data = await res.json()
      user.value = {
        id: data.id,
        username: data.username,
        avatar: data.avatar,
        isAdmin: Boolean(data.is_admin),
      }
    }catch {
      user.value = null
    }
  }

  function setUser(newUser: User) {
    user.value = newUser
  }

  async function clearUser() {
    user.value = null
    await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`,
      {
        method: 'POST', credentials: 'include'
      }).catch(() => {})
  }

  return { user, isLoggedIn, isAdmin, setUser, clearUser, fetchUser }
})