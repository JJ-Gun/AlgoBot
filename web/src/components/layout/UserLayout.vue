<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

function getAvatarUrl(): string | null {
  const user = userStore.user
  if (!user?.avatar) return null
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
}

function login() {
  window.location.href = 'http://localhost:3000/auth/discord'
}

function logout() {
  userStore.clearUser()
}
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="side left">
        <div class="logo">알고봇</div>
      </div>
      <nav class="nav">
        <RouterLink to="/" active-class="" exact-active-class="router-link-active">홈</RouterLink>
        <RouterLink to="/notice">공지사항</RouterLink>
        <RouterLink to="/voice">목소리 · 설정</RouterLink>
        <RouterLink to="/inquiry">문의</RouterLink>
      </nav>
      <div class="side right">
        <div class="auth">
          <template v-if="userStore.isLoggedIn">
            <img v-if="getAvatarUrl()" :src="getAvatarUrl()!" class="avatar-img" :alt="userStore.user!.username">
            <div v-else class="avatar">{{ userStore.user!.username.slice(0, 2).toUpperCase() }}</div>
            <span class="username">{{ userStore.user!.username }}</span>
            <n-button size="small" @click="logout">로그아웃</n-button>
          </template>
          <template v-else>
            <n-button size="small" type="info" @click="login">Discord 로그인</n-button>
          </template>
        </div>
      </div>
    </header>
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 56px;
  border-bottom: 0.5px solid #e8e8e8;
  background: #fff;
}

.side {
  flex: 1;
  display: flex;
  align-items: center;
}

.side.left {
  justify-content: flex-start;
}

.side.right {
  justify-content: flex-end;
}

.logo {
  font-size: 15px;
  font-weight: 500;
}

.nav {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.nav a {
  font-size: 14px;
  text-decoration: none;
  color: #888;
  padding: 6px 14px;
  border-radius: 8px;
}

.nav a.router-link-active {
  font-weight: 500;
  color: #333;
  background: #f5f5f5;
}

.auth {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e6f1fb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 500;
  color: #185fa5;
}

.username {
  font-size: 13px;
}

.main {
  flex: 1;
  background: #f5f5f5;
}
</style>