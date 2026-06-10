<script setup lang="ts">
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-title">관리자</div>
      <nav class="nav">
        <RouterLink to="/admin">사용량</RouterLink>
        <RouterLink to="/admin/status">봇 상태</RouterLink>
        <RouterLink to="/admin/logs">에러 로그</RouterLink>
        <RouterLink to="/admin/inquiry">문의</RouterLink>
        <RouterLink to="/admin/notice">공지</RouterLink>
      </nav>
    </aside>
    <div class="content">
      <main class="main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
}

.sidebar {
  width: 200px;
  border-right: 1px solid #eee;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: bold;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nav a {
  text-decoration: none;
  color: inherit;
  padding: 8px 12px;
  border-radius: 6px;
}

.nav a.router-link-active {
  font-weight: bold;
  background-color: #f5f5f5;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  padding: 24px;
}
</style>