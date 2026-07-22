<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

interface Notice {
  id: number
  title: string
  content: string
  created_at: string
}

const notices = ref<Notice[]>([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref<number | null>(null)

const showModal = ref(false)
const editTarget = ref<{ id: number | null; title: string; content: string }>({ id: null, title: '', content: '' })

function formatDate(dateStr: string) {
  return dateStr.slice(0, 10).replace(/-/g, '. ')
}

async function loadNotices() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/notices`, {
      credentials: 'include'
    })
    if (!res.ok) throw new Error('공지 목록 조회 실패')
    notices.value = await res.json()
  } catch (err) {
    console.error('공지 목록 로딩 실패:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadNotices)

function openCreate() {
  editTarget.value = { id: null, title: '', content: '' }
  showModal.value = true
}

function openEdit(notice: Notice) {
  editTarget.value = { id: notice.id, title: notice.title, content: notice.content }
  showModal.value = true
}

async function submit() {
  if (!editTarget.value.title.trim() || !editTarget.value.content.trim()) return

  saving.value = true
  try {
    const url = editTarget.value.id
      ? `${import.meta.env.VITE_API_URL}/admin/notices/${editTarget.value.id}`
      : `${import.meta.env.VITE_API_URL}/admin/notices`
    const method = editTarget.value.id ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ title: editTarget.value.title, content: editTarget.value.content }),
    })
    if (!res.ok) throw new Error('저장 실패')

    showModal.value = false
    await loadNotices()
  } catch (err) {
    console.error('공지 저장 실패:', err)
  } finally {
    saving.value = false
  }
}

async function deleteNotice(id: number) {
  deleting.value = id
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/notices/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (!res.ok) throw new Error('삭제 실패')
    await loadNotices()
  } catch (err) {
    console.error('공지 삭제 실패:', err)
  } finally {
    deleting.value = null
  }
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
          <n-button type="info" size="small" :disabled="saving" @click="submit">
            {{ saving ? '저장 중...' : (editTarget.id ? '수정' : '작성') }}
          </n-button>
        </div>
      </div>
    </n-modal>

    <div v-if="loading" class="loading-notice">불러오는 중...</div>
    <div v-else-if="notices.length === 0" class="empty-notice">등록된 공지가 없습니다.</div>

    <div v-else class="notice-list">
      <div v-for="notice in notices" :key="notice.id" class="notice-card">
        <div class="notice-header">
          <div class="notice-info">
            <div class="notice-title">{{ notice.title }}</div>
            <div class="notice-date">{{ formatDate(notice.created_at) }}</div>
          </div>
          <div class="notice-actions">
            <n-button size="small" @click="openEdit(notice)">수정</n-button>
            <n-button
              size="small"
              :disabled="deleting === notice.id"
              @click="deleteNotice(notice.id)"
            >
              {{ deleting === notice.id ? '삭제 중...' : '삭제' }}
            </n-button>
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

.loading-notice,
.empty-notice {
  font-size: 13px;
  color: #aaa;
  padding: 24px 0;
  text-align: center;
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