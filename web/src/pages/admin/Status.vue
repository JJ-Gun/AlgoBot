<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

interface Resources {
  total: number
  used: number
  swapTotal: number
  swapUsed: number
  cpuUsed: string
}

interface HealthState {
  bot: string
  melo: string
  kokoro: string
  resources: Resources | null
  lastChecked: string | null
}

const state = ref<HealthState | null>(null)
const loading = ref(true)
let intervalId: number | undefined

const statusLabel: Record<string, { label: string; color: string }> = {
  ok: { label: '정상', color: '#18a058' },
  error: { label: '오류', color: '#d03050' },
  unknown: { label: '확인 중', color: '#aaa' },
}

async function loadStatus() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/status`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    if (!res.ok) throw new Error('상태 조회 실패')
    state.value = await res.json()
  } catch (err) {
    console.error('상태 조회 실패:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStatus()
  intervalId = window.setInterval(loadStatus, 10_000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="status">
    <div class="page-title">봇 상태</div>

    <div v-if="loading" class="loading-notice">불러오는 중...</div>

    <template v-else-if="state">
      <div class="section-label">서비스</div>
      <div class="card-list">
        <div class="card">
          <div class="card-row">
            <span class="card-name">Discord 봇</span>
            <span class="status-text" :style="{ color: statusLabel[state.bot]?.color }">
              <span class="dot" :style="{ background: statusLabel[state.bot]?.color }"></span>
              {{ statusLabel[state.bot]?.label ?? state.bot }}
            </span>
          </div>
        </div>
        <div class="card">
          <div class="card-row">
            <span class="card-name">MeloTTS 서버</span>
            <span class="status-text" :style="{ color: statusLabel[state.melo]?.color }">
              <span class="dot" :style="{ background: statusLabel[state.melo]?.color }"></span>
              {{ statusLabel[state.melo]?.label ?? state.melo }}
            </span>
          </div>
        </div>
        <div class="card">
          <div class="card-row">
            <span class="card-name">Kokoro 서버</span>
            <span class="status-text" :style="{ color: statusLabel[state.kokoro]?.color }">
              <span class="dot" :style="{ background: statusLabel[state.kokoro]?.color }"></span>
              {{ statusLabel[state.kokoro]?.label ?? state.kokoro }}
            </span>
          </div>
        </div>
      </div>

      <div class="section-label">리소스</div>
      <div v-if="!state.resources" class="card resources-unavailable">
        리눅스(운영) 환경에서만 확인할 수 있습니다.
      </div>
      <div v-else class="card-list">
        <div class="card">
          <div class="card-row">
            <span class="card-name">CPU 사용률</span>
            <span class="card-val">{{ state.resources.cpuUsed }}%</span>
          </div>
        </div>
        <div class="card">
          <div class="card-row">
            <span class="card-name">메모리 사용량</span>
            <span class="card-val">{{ state.resources.used }} MB / {{ state.resources.total }} MB</span>
          </div>
        </div>
        <div class="card">
          <div class="card-row">
            <span class="card-name">스왑 사용량</span>
            <span class="card-val">{{ state.resources.swapUsed }} MB / {{ state.resources.swapTotal }} MB</span>
          </div>
        </div>
      </div>

      <div v-if="state.lastChecked" class="last-checked">
        마지막 확인: {{ new Date(state.lastChecked).toLocaleTimeString('ko-KR') }}
      </div>
    </template>
  </div>
</template>

<style scoped>
.status {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 20px;
}

.loading-notice {
  font-size: 13px;
  color: #aaa;
  padding: 24px 0;
  text-align: center;
}

.section-label {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 8px;
  margin-top: 16px;
}

.section-label:first-of-type {
  margin-top: 0;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card {
  background: #fff;
  border: 0.5px solid #e8e8e8;
  border-radius: 12px;
  padding: 14px 16px;
}

.card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-name {
  font-size: 14px;
}

.status-text {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.card-val {
  font-size: 14px;
  font-weight: 500;
}

.resources-unavailable {
  font-size: 13px;
  color: #aaa;
}

.last-checked {
  font-size: 12px;
  color: #bbb;
  margin-top: 16px;
  text-align: right;
}
</style>