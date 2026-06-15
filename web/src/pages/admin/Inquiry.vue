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

const expanded = ref<number | null>(null)

function toggle(id: number) {
  expanded.value = expanded.value === id ? null : id
}
</script>

<template>
  <div class="inquiry">
    <div class="page-title">문의</div>

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

        <div v-if="expanded === inq.id" class="inquiry-detail">
          <div class="detail-section">
            <div class="detail-label">문의 내용</div>
            <div class="detail-content">{{ inq.content }}</div>
          </div>
          <div class="detail-section">
            <div class="detail-label">답변</div>
            <n-input
              v-model:value="inq.reply"
              type="textarea"
              placeholder="답변을 입력하세요"
              :rows="3"
              size="small"
            />
          </div>
          <div class="detail-footer">
            <n-select
              v-model:value="inq.status"
              :options="Object.entries(statusMap).map(([k, v]) => ({ label: v.label, value: k }))"
              size="small"
              style="width: 120px;"
            />
            <n-button type="info" size="small">저장</n-button>
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

.page-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 20px;
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

.detail-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
</style>