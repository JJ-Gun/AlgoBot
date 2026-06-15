<script setup lang="ts">
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-title">관리자</div>
      <nav class="nav">
        <RouterLink to="/admin" active-class="" exact-active-class="router-link-active">사용량</RouterLink>
        <RouterLink to="/admin/status">봇 상태</RouterLink>
        <RouterLink to="/admin/logs">에러 로그</RouterLink>
        <RouterLink to="/admin/inquiry">문의</RouterLink>
        <RouterLink to="/admin/notice">공지</RouterLink>
      </nav>
    </aside>
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
}

.sidebar {
  width: 180px;
  border-right: 0.5px solid #e8e8e8;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fff;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 15px;
  font-weight: 500;
  padding-bottom: 16px;
  border-bottom: 0.5px solid #e8e8e8;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav a {
  font-size: 14px;
  text-decoration: none;
  color: #888;
  padding: 8px 12px;
  border-radius: 8px;
}

.nav a.router-link-active {
  font-weight: 500;
  color: #333;
  background: #f5f5f5;
}

.main {
  flex: 1;
  background: #f5f5f5;
}
</style>