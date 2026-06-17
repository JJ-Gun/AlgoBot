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
  const token = ref<string | null>(localStorage.getItem('token'))

  const isLoggedIn = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.isAdmin ?? false)

  async function fetchUser() {
    if (!token.value) return
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      if (!res.ok) throw new Error('인증 실패')
      const data = await res.json()
      user.value = {
        id: data.id,
        username: data.username,
        avatar: data.avatar,
        isAdmin: Boolean(data.is_admin),
      }
    } catch {
      clearUser()
    }
  }

  function setUser(newUser: User, newToken: string) {
    user.value = newUser
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function clearUser() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  return { user, token, isLoggedIn, isAdmin, setUser, clearUser, fetchUser }
})