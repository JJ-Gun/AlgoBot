<script setup lang="ts">
</script>

<template>
  <div class="notice">
    <div class="page-header">
      <h2>공지사항</h2>
    </div>
    <div class="notice-list">
      <div class="notice-card">
        <div class="notice-card-header">
          <div class="notice-title">서버 점검 안내</div>
          <div class="notice-date">2026. 06. 10</div>
        </div>
        <div class="notice-body">
          6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.
        </div>
      </div>
      <div class="notice-card">
        <div class="notice-card-header">
          <div class="notice-title">Kokoro 엔진 업데이트</div>
          <div class="notice-date">2026. 05. 20</div>
        </div>
        <div class="notice-body">
          Kokoro 엔진이 최신 버전으로 업데이트되었습니다. 한국어 발음 품질이 개선되었습니다.
        </div>
      </div>
      <div class="notice-card">
        <div class="notice-card-header">
          <div class="notice-title">알고봇 출시</div>
          <div class="notice-date">2026. 04. 10</div>
        </div>
        <div class="notice-body">
          알고봇이 정식 출시되었습니다. Discord 서버에 초대해서 사용해 보세요.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notice {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notice-card {
  background: #fff;
  border: 0.5px solid #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
}

.notice-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 0.5px solid #f0f0f0;
}

.notice-title {
  font-size: 14px;
  font-weight: 500;
}

.notice-date {
  font-size: 12px;
  color: #aaa;
}

.notice-body {
  padding: 14px 16px;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}
</style>