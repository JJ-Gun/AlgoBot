<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<template>
  <div class="home">
    <div class="greeting">
        <h2 v-if="userStore.isLoggedIn">안녕하세요, {{ userStore.user?.username }}님!</h2>
        <h2 v-else>알고봇에 오신 것을 환영합니다</h2>
        <p>알고봇 설정을 관리하세요.</p>
    </div>
    <div class="grid">
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <n-icon size="16"><i class="ti ti-bell" /></n-icon>
            공지사항
          </div>
          <RouterLink to="/notice" class="card-link">더보기 →</RouterLink>
        </div>
        <div class="notice-item">
          <div class="notice-title">서버 점검 안내</div>
          <div class="notice-meta">2026. 06. 10</div>
        </div>
        <div class="notice-item">
          <div class="notice-title">Kokoro 엔진 업데이트</div>
          <div class="notice-meta">2026. 05. 20</div>
        </div>
        <div class="notice-item">
          <div class="notice-title">알고봇 출시</div>
          <div class="notice-meta">2026. 04. 10</div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <n-icon size="16"><i class="ti ti-message" /></n-icon>
            최근 문의
          </div>
          <RouterLink to="/inquiry" class="card-link">더보기 →</RouterLink>
        </div>
        <div class="inquiry-item">
          <div class="inquiry-title">목소리 추가 요청드립니다</div>
          <div class="inquiry-meta">
            <n-tag size="small" type="warning">검토중</n-tag>
            <span>2026. 06. 08</span>
          </div>
        </div>
        <div class="inquiry-item">
          <div class="inquiry-title">TTS 끊김 버그 리포트</div>
          <div class="inquiry-meta">
            <n-tag size="small" type="success">해결됨</n-tag>
            <span>2026. 05. 30</span>
          </div>
        </div>
        <div class="inquiry-item">
          <div class="inquiry-title">속도 조절 기능 문의</div>
          <div class="inquiry-meta">
            <n-tag size="small">대기중</n-tag>
            <span>2026. 05. 15</span>
          </div>
        </div>
      </div>
    </div>
    <div class="card settings-card">
        <div class="card-header">
            <div class="card-title">
            <n-icon size="16"><i class="ti ti-microphone" /></n-icon>
            내 설정
            </div>
            <RouterLink v-if="userStore.isLoggedIn" to="/voice" class="card-link">변경 →</RouterLink>
        </div>
        <template v-if="userStore.isLoggedIn">
            <div class="settings-row">
            <div>
                <div class="settings-label">현재 목소리</div>
                <div class="settings-meta">한국어 남성 · edge-tts</div>
            </div>
            <div class="settings-right">
                <span class="settings-val">인준</span>
                <n-tag size="small" type="info">사용중</n-tag>
            </div>
            </div>
            <div class="settings-row settings-speed">
            <div class="settings-label">재생 속도</div>
            <div class="settings-val">1.0x</div>
            </div>
        </template>
        <div v-else class="login-required">
            설정을 보려면 로그인이 필요합니다.
        </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.greeting {
  margin-bottom: 20px;
}

.greeting h2 {
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 4px;
}

.greeting p {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.card {
  background: #fff;
  border: 0.5px solid #e8e8e8;
  border-radius: 12px;
  padding: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-link {
  font-size: 12px;
  color: #378add;
  text-decoration: none;
}

.notice-item {
  padding: 8px 0;
  border-bottom: 0.5px solid #f0f0f0;
}

.notice-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.notice-title {
  font-size: 13px;
  margin-bottom: 2px;
}

.notice-meta {
  font-size: 11px;
  color: #aaa;
}

.inquiry-item {
  padding: 8px 0;
  border-bottom: 0.5px solid #f0f0f0;
}

.inquiry-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.inquiry-title {
  font-size: 13px;
  margin-bottom: 4px;
}

.inquiry-meta {
  font-size: 11px;
  color: #aaa;
  display: flex;
  align-items: center;
  gap: 8px;
}

.settings-card {
  margin-bottom: 0;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 0.5px solid #f0f0f0;
}

.settings-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.settings-label {
  font-size: 13px;
  margin-bottom: 2px;
}

.settings-meta {
  font-size: 12px;
  color: #aaa;
}

.settings-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.settings-val {
  font-size: 14px;
  font-weight: 500;
}

.settings-speed {
  margin-top: 0;
}

.login-required {
  font-size: 13px;
  color: #aaa;
  padding: 16px 0;
  text-align: center;
}

</style>