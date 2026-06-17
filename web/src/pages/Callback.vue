<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

onMounted(async () => {
  const token = route.query.token as string | undefined
  if (!token) {
    router.replace('/')
    return
  }

  try {
    const res = await fetch('http://localhost:3000/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('인증 실패')
    const user = await res.json()

    userStore.setUser(
      {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        isAdmin: Boolean(user.is_admin),
      },
      token
    )

    router.replace('/')
  } catch (err) {
    console.error('로그인 처리 중 오류:', err)
    router.replace('/')
  }
})
</script>

<template>
  <div class="callback">
    <p>로그인 처리 중입니다...</p>
  </div>
</template>

<style scoped>
.callback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: 14px;
  color: #888;
}
</style>