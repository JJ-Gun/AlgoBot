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
  const token = ref<string | null>(null)

  const isLoggedIn = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.isAdmin ?? false)

  function setUser(newUser: User, newToken: string) {
    user.value = newUser
    token.value = newToken
  }

  function clearUser() {
    user.value = null
    token.value = null
  }

  return { user, token, isLoggedIn, isAdmin, setUser, clearUser }
})