<script setup lang="ts">
</script>

<template>
  <div class="layout">
    <header class="header">
      <nav class="nav">
        <RouterLink to="/">공지사항</RouterLink>
        <RouterLink to="/voice">목소리</RouterLink>
        <RouterLink to="/settings">설정</RouterLink>
        <RouterLink to="/inquiry">문의</RouterLink>
      </nav>
      <div class="auth">
        <n-button>Discord 로그인</n-button>
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
  height: 60px;
  border-bottom: 1px solid #eee;
}

.nav {
  display: flex;
  gap: 24px;
}

.nav a {
  text-decoration: none;
  color: inherit;
}

.nav a.router-link-active {
  font-weight: bold;
}

.main {
  flex: 1;
  padding: 24px;
}
</style>