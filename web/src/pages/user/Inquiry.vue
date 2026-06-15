<script setup lang="ts">
import { ref } from 'vue'

const inquiries = ref([
  { id: 1, title: '목소리 추가 요청드립니다', type: '기능 제안', status: 'reviewing', date: '2026. 06. 08', content: '다양한 목소리가 추가되면 좋겠습니다.', reply: '' },
  { id: 2, title: 'TTS 끊김 버그 리포트', type: '버그 리포트', status: 'resolved', date: '2026. 05. 30', content: '가끔 TTS가 중간에 끊깁니다.', reply: '수정 완료했습니다.' },
  { id: 3, title: '속도 조절 기능 문의', type: '기타 문의', status: 'pending', date: '2026. 05. 15', content: '속도 조절은 어디서 하나요?', reply: '' },
])

const statusMap: Record<string, { label: string; type: 'default' | 'info' | 'success' | 'warning' | 'error' }> = {
  pending: { label: '대기중', type: 'default' },
  reviewing: { label: '검토중', type: 'warning' },
  resolved: { label: '해결됨', type: 'success' },
}

const expanded = ref<Set<number>>(new Set())

function toggle(id: number) {
  if (expanded.value.has(id)) {
    expanded.value.delete(id)
  } else {
    expanded.value.add(id)
  }
  expanded.value = new Set(expanded.value)
}

const showModal = ref(false)
const form = ref({ type: '버그 리포트', title: '', content: '' })
const typeOptions = ['버그 리포트', '기능 제안', '기타 문의']
</script>

<template>
  <div class="inquiry">
    <div class="page-header">
      <h2>문의</h2>
      <n-button type="info" size="small" @click="showModal = true">문의하기</n-button>
    </div>

    <n-modal v-model:show="showModal" preset="card" title="문의하기" style="max-width: 480px;">
      <div class="form-inner">
        <div class="form-row">
          <div class="form-label">유형</div>
          <n-select v-model:value="form.type" :options="typeOptions.map(t => ({ label: t, value: t }))" size="small" />
        </div>
        <div class="form-row">
          <div class="form-label">제목</div>
          <n-input v-model:value="form.title" placeholder="제목을 입력하세요" size="small" />
        </div>
        <div class="form-row">
          <div class="form-label">내용</div>
          <n-input
            v-model:value="form.content"
            type="textarea"
            placeholder="내용을 입력하세요"
            :rows="4"
            size="small"
          />
        </div>
        <div class="form-footer">
          <n-button size="small" @click="showModal = false">취소</n-button>
          <n-button type="info" size="small">제출</n-button>
        </div>
      </div>
    </n-modal>

    <div class="inquiry-list">
      <div v-for="inq in inquiries" :key="inq.id" class="inquiry-card">
        <div class="inquiry-top" @click="toggle(inq.id)">
          <div class="inquiry-info">
            <div class="inquiry-title">{{ inq.title }}</div>
            <div class="inquiry-meta">
              <span>{{ inq.type }}</span>
              <span>{{ inq.date }}</span>
            </div>
          </div>
          <n-tag :type="statusMap[inq.status]?.type ?? 'default'" size="small">
            {{ statusMap[inq.status]?.label ?? inq.status }}
          </n-tag>
        </div>

        <div v-if="expanded.has(inq.id)" class="inquiry-detail">
          <div class="detail-section">
            <div class="detail-label">문의 내용</div>
            <div class="detail-content">{{ inq.content }}</div>
          </div>
          <div v-if="inq.reply" class="detail-section">
            <div class="detail-label">답변</div>
            <div class="detail-content reply">{{ inq.reply }}</div>
          </div>
          <div v-else class="detail-section">
            <div class="detail-label">답변</div>
            <div class="detail-content no-reply">아직 답변이 등록되지 않았습니다.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inquiry {
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

.page-header h2 {
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

.inquiry-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inquiry-card {
  background: #fff;
  border: 0.5px solid #e8e8e8;
  border-radius: 12px;
  padding: 14px 16px;
}

.inquiry-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.inquiry-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.inquiry-title {
  font-size: 14px;
  font-weight: 500;
}

.inquiry-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #aaa;
}

.inquiry-detail {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 0.5px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 12px;
  color: #aaa;
}

.detail-content {
  font-size: 13px;
  line-height: 1.6;
}

.reply {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 10px 12px;
}

.no-reply {
  color: #aaa;
}
</style>