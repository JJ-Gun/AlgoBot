<script setup lang="ts">
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="logo">알고봇</div>
      <nav class="nav">
        <RouterLink to="/">홈</RouterLink>
        <RouterLink to="/notice">공지사항</RouterLink>
        <RouterLink to="/voice">목소리 · 설정</RouterLink>
        <RouterLink to="/inquiry">문의</RouterLink>
      </nav>
      <div class="auth">
        <div class="avatar">JJ</div>
        <span class="username">jayden</span>
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
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  border-bottom: 0.5px solid var(--n-border-color);
  background: #fff;
}

.logo {
  font-size: 15px;
  font-weight: 500;
}

.nav {
  display: flex;
  gap: 24px;
}

.nav a {
  font-size: 14px;
  text-decoration: none;
  color: var(--n-text-color-3);
}

.nav a.router-link-active {
  font-weight: 500;
  color: var(--n-text-color);
}

.auth {
  display: flex;
  align-items: center;
  gap: 8px;
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