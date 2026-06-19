<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

interface Notice {
  id: number
  title: string
  created_at: string
}

interface Inquiry {
  id: number
  title: string
  status: string
  created_at: string
}

interface VoiceOption {
  key: string
  lang: string
  displayName: string
  engine: string
}

const userStore = useUserStore()
const router = useRouter()

function goToNotice(id: number) {
  router.push({ path: '/notice', query: { id } })
}

function goToInquiry(id: number) {
  router.push({ path: '/inquiry', query: { id } })
}

const notices = ref<Notice[]>([])
const inquiries = ref<Inquiry[]>([])
const mySettings = ref<{ voice_key: string; speed: number } | null>(null)
const voices = ref<VoiceOption[]>([])
const loading = ref(true)

const statusMap: Record<string, { label: string; type: 'default' | 'info' | 'success' | 'warning' | 'error' }> = {
  pending: { label: '대기중', type: 'default' },
  reviewing: { label: '검토중', type: 'warning' },
  resolved: { label: '해결됨', type: 'success' },
}

const engineLabel: Record<string, string> = {
  edge: 'edge-tts',
  melo: 'MeloTTS',
  kokoro: 'Kokoro',
}

function formatDate(dateStr: string) {
  return dateStr.slice(0, 10).replace(/-/g, '. ')
}

const myVoice = ref<VoiceOption | null>(null)

async function loadAll() {
  try {
    const [noticeRes, inquiryRes, voiceRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/notices`),
      fetch(`${import.meta.env.VITE_API_URL}/inquiries`),
      fetch(`${import.meta.env.VITE_API_URL}/user/voices`),
    ])
    notices.value = (await noticeRes.json()).slice(0, 3)
    inquiries.value = (await inquiryRes.json()).slice(0, 3)
    voices.value = await voiceRes.json()

    if (userStore.token) {
      const settingsRes = await fetch(`${import.meta.env.VITE_API_URL}/user/settings`, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      })
      if (settingsRes.ok) {
        mySettings.value = await settingsRes.json()
        myVoice.value = voices.value.find(v => v.key === mySettings.value?.voice_key) ?? null
      }
    }
  } catch (err) {
    console.error('홈 데이터 로딩 실패:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)
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
        <div v-if="loading" class="empty-row">불러오는 중...</div>
        <div v-else-if="notices.length === 0" class="empty-row">등록된 공지사항이 없습니다.</div>
        <div v-else class="notice-item" v-for="n in notices" :key="n.id" @click="goToNotice(n.id)">
          <div class="notice-title">{{ n.title }}</div>
          <div class="notice-meta">{{ formatDate(n.created_at) }}</div>
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
        <div v-if="loading" class="empty-row">불러오는 중...</div>
        <div v-else-if="inquiries.length === 0" class="empty-row">등록된 문의가 없습니다.</div>
        <div v-else class="inquiry-item" v-for="inq in inquiries" :key="inq.id" @click="goToInquiry(inq.id)">
          <div class="inquiry-title">{{ inq.title }}</div>
          <div class="inquiry-meta">
            <n-tag size="small" :type="statusMap[inq.status]?.type ?? 'default'">
              {{ statusMap[inq.status]?.label ?? inq.status }}
            </n-tag>
            <span>{{ formatDate(inq.created_at) }}</span>
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
        <div v-if="loading" class="empty-row">불러오는 중...</div>
        <template v-else-if="myVoice && mySettings">
          <div class="settings-row">
            <div>
              <div class="settings-label">현재 목소리</div>
              <div class="settings-meta">{{ myVoice.lang }} · {{ engineLabel[myVoice.engine] }}</div>
            </div>
            <div class="settings-right">
              <span class="settings-val">{{ myVoice.displayName }}</span>
              <n-tag size="small" type="info">사용중</n-tag>
            </div>
          </div>
          <div class="settings-row settings-speed">
            <div class="settings-label">재생 속도</div>
            <div class="settings-val">{{ mySettings.speed.toFixed(1) }}x</div>
          </div>
        </template>
        <div v-else class="empty-row">설정 정보를 불러올 수 없습니다.</div>
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

.empty-row {
  font-size: 12px;
  color: #aaa;
  padding: 8px 0;
}

.notice-item {
  padding: 8px 0;
  border-bottom: 0.5px solid #f0f0f0;
  cursor: pointer;
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
  cursor: pointer;
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