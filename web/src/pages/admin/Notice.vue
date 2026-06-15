<script setup lang="ts">
import { ref } from 'vue'

const notices = ref([
  { id: 1, title: '서버 점검 안내', content: '6월 12일 오전 2시~4시 서버 점검이 예정되어 있습니다. 점검 중에는 봇 사용이 불가할 수 있습니다.', date: '2026. 06. 10' },
  { id: 2, title: 'Kokoro 엔진 업데이트', content: 'Kokoro 엔진이 최신 버전으로 업데이트되었습니다. 한국어 발음 품질이 개선되었습니다.', date: '2026. 05. 20' },
  { id: 3, title: '알고봇 출시', content: '알고봇이 정식 출시되었습니다. Discord 서버에 초대해서 사용해 보세요.', date: '2026. 04. 10' },
])

const showModal = ref(false)
const editTarget = ref<{ id: number | null; title: string; content: string }>({ id: null, title: '', content: '' })

function openCreate() {
  editTarget.value = { id: null, title: '', content: '' }
  showModal.value = true
}

function openEdit(notice: { id: number; title: string; content: string; date: string }) {
  editTarget.value = { id: notice.id, title: notice.title, content: notice.content }
  showModal.value = true
}

function deleteNotice(id: number) {
  notices.value = notices.value.filter(n => n.id !== id)
}
</script>

<template>
  <div class="notice">
    <div class="page-header">
      <div class="page-title">공지</div>
      <n-button type="info" size="small" @click="openCreate">공지 작성</n-button>
    </div>

    <n-modal v-model:show="showModal" preset="card" :title="editTarget.id ? '공지 수정' : '공지 작성'" style="max-width: 480px;">
      <div class="form-inner">
        <div class="form-row">
          <div class="form-label">제목</div>
          <n-input v-model:value="editTarget.title" placeholder="제목을 입력하세요" size="small" />
        </div>
        <div class="form-row">
          <div class="form-label">내용</div>
          <n-input
            v-model:value="editTarget.content"
            type="textarea"
            placeholder="내용을 입력하세요"
            :rows="5"
            size="small"
          />
        </div>
        <div class="form-footer">
          <n-button size="small" @click="showModal = false">취소</n-button>
          <n-button type="info" size="small">{{ editTarget.id ? '수정' : '작성' }}</n-button>
        </div>
      </div>
    </n-modal>

    <div class="notice-list">
      <div v-for="notice in notices" :key="notice.id" class="notice-card">
        <div class="notice-header">
          <div class="notice-info">
            <div class="notice-title">{{ notice.title }}</div>
            <div class="notice-date">{{ notice.date }}</div>
          </div>
          <div class="notice-actions">
            <n-button size="small" @click="openEdit(notice)">수정</n-button>
            <n-button size="small" @click="deleteNotice(notice.id)">삭제</n-button>
          </div>
        </div>
        <div class="notice-content">{{ notice.content }}</div>
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

.form-inner {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  color: #aaa;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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
}

.notice-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
}

.notice-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notice-title {
  font-size: 14px;
  font-weight: 500;
}

.notice-date {
  font-size: 12px;
  color: #aaa;
}

.notice-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.notice-content {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}
</style>