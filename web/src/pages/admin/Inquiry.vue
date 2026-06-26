<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

interface Inquiry {
  id: number
  user_id: string
  username: string
  type: string
  title: string
  content: string
  reply: string
  status: string
  created_at: string
}

const inquiries = ref<Inquiry[]>([])
const loading = ref(true)
const saving = ref<number | null>(null)

const statusMap: Record<string, { label: string; type: 'default' | 'info' | 'success' | 'warning' | 'error' }> = {
  pending: { label: '대기중', type: 'default' },
  reviewing: { label: '검토중', type: 'warning' },
  resolved: { label: '해결됨', type: 'success' },
}

const expanded = ref<number | null>(null)
const draftReply = ref<Record<number, string>>({})
const draftStatus = ref<Record<number, string>>({})

function toggle(inq: Inquiry) {
  expanded.value = expanded.value === inq.id ? null : inq.id
  if (!(inq.id in draftReply.value)) draftReply.value[inq.id] = inq.reply
  if (!(inq.id in draftStatus.value)) draftStatus.value[inq.id] = inq.status
}

function formatDate(dateStr: string) {
  return dateStr.slice(0, 10).replace(/-/g, '. ')
}

async function loadInquiries() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/inquiries`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    if (!res.ok) throw new Error('문의 목록 조회 실패')
    inquiries.value = await res.json()
  } catch (err) {
    console.error('문의 목록 로딩 실패:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadInquiries)

async function save(inq: Inquiry) {
  saving.value = inq.id
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/inquiries/${inq.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.token}`,
      },
      body: JSON.stringify({
        reply: draftReply.value[inq.id],
        status: draftStatus.value[inq.id],
      }),
    })
    if (!res.ok) throw new Error('저장 실패')
    await loadInquiries()
  } catch (err) {
    console.error('답변 저장 실패:', err)
  } finally {
    saving.value = null
  }
}
</script>

<template>
  <div class="inquiry">
    <div class="page-title">문의</div>

    <div v-if="loading" class="loading-notice">불러오는 중...</div>
    <div v-else-if="inquiries.length === 0" class="empty-notice">등록된 문의가 없습니다.</div>

    <div v-else class="inquiry-list">
      <div v-for="inq in inquiries" :key="inq.id" class="inquiry-card">
        <div class="inquiry-top" @click="toggle(inq)">
          <div class="inquiry-info">
            <div class="inquiry-title">{{ inq.title }}</div>
            <div class="inquiry-meta">
              <span>{{ inq.username }}</span>
              <span>{{ inq.type }}</span>
              <span>{{ formatDate(inq.created_at) }}</span>
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
              v-model:value="draftReply[inq.id]"
              type="textarea"
              placeholder="답변을 입력하세요"
              :rows="3"
              size="small"
            />
          </div>
          <div class="detail-footer">
            <n-select
              v-model:value="draftStatus[inq.id]"
              :options="Object.entries(statusMap).map(([k, v]) => ({ label: v.label, value: k }))"
              size="small"
              style="width: 120px;"
            />
            <n-button
              type="info"
              size="small"
              :disabled="saving === inq.id"
              @click="save(inq)"
            >
              {{ saving === inq.id ? '저장 중...' : '저장' }}
            </n-button>
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

.loading-notice,
.empty-notice {
  font-size: 13px;
  color: #aaa;
  padding: 24px 0;
  text-align: center;
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