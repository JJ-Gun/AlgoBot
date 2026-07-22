<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

interface LogEntry {
  id: number
  level: string
  message: string
  created_at: string
}

const logs = ref<LogEntry[]>([])
const loading = ref(true)

function formatTime(dateStr: string) {
  const d = new Date(dateStr.replace(' ', 'T') + 'Z')
  return d.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

async function loadLogs() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/logs`, {
      credentials: 'include'
    })
    if (!res.ok) throw new Error('로그 조회 실패')
    logs.value = await res.json()
  } catch (err) {
    console.error('로그 조회 실패:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadLogs)
</script>

<template>
  <div class="logs">
    <div class="page-title">에러 로그</div>

    <div v-if="loading" class="loading-notice">불러오는 중...</div>
    <div v-else-if="logs.length === 0" class="empty-notice">기록된 로그가 없습니다.</div>

    <div v-else class="log-card">
      <div
        v-for="log in logs"
        :key="log.id"
        class="log-row"
      >
        <span class="log-time">{{ formatTime(log.created_at) }}</span>
        <span class="log-level" :class="log.level === 'ERROR' ? 'error' : 'warn'">[{{ log.level }}]</span>
        <span class="log-message" :class="log.level === 'ERROR' ? 'error' : 'warn'">{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logs {
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

.log-card {
  background: #fff;
  border: 0.5px solid #e8e8e8;
  border-radius: 12px;
  padding: 0 16px;
}

.log-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 0.5px solid #f0f0f0;
  font-family: monospace;
  font-size: 13px;
}

.log-row:last-child {
  border-bottom: none;
}

.log-time {
  color: #aaa;
  flex-shrink: 0;
}

.log-level {
  flex-shrink: 0;
  font-weight: 500;
}

.log-message {
  word-break: break-all;
}

.error {
  color: #d03050;
}

.warn {
  color: #f0a020;
}
</style>