<script setup lang="ts">
import { ref } from 'vue'

const notices = ref([
  { id: 1, title: '서버 점검 안내', content: '6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.', date: '2026. 06. 10' },
  { id: 2, title: 'Kokoro 엔진 업데이트', content: 'Kokoro 엔진이 최신 버전으로 업데이트되었습니다. 한국어 발음 품질이 개선되었습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.', date: '2026. 05. 20' },
  { id: 3, title: '알고봇 출시', content: '알고봇이 정식 출시되었습니다. Discord 서버에 초대해서 사용해 보세요.', date: '2026. 04. 10' },
])

const expanded = ref<Set<number>>(new Set())

function toggle(id: number) {
  if (expanded.value.has(id)) {
    expanded.value.delete(id)
  } else {
    expanded.value.add(id)
  }
  expanded.value = new Set(expanded.value)
}
</script>

<template>
  <div class="notice">
    <div class="page-header">
      <h2>공지사항</h2>
    </div>
    <div class="notice-list">
      <div
        v-for="notice in notices"
        :key="notice.id"
        class="notice-card"
        @click="toggle(notice.id)"
      >
        <div class="notice-header">
          <div class="notice-title">{{ notice.title }}</div>
          <div class="notice-date">{{ notice.date }}</div>
        </div>
        <div class="notice-content" :class="{ expanded: expanded.has(notice.id) }">
          {{ notice.content }}
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
  gap: 8px;
}

.notice-card {
  background: #fff;
  border: 0.5px solid #e8e8e8;
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
}

.notice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.notice-title {
  font-size: 14px;
  font-weight: 500;
}

.notice-date {
  font-size: 12px;
  color: #aaa;
}

.notice-content {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.notice-content.expanded {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
}
</style>