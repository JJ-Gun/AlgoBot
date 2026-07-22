<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'

interface VoiceOption {
  key: string
  lang: string
  displayName: string
  engine: string
}

interface VoiceState extends VoiceOption {
  draftSpeed: number
  expanded: boolean
}

const userStore = useUserStore()

const voices = ref<VoiceState[]>([])
const currentVoiceKey = ref<string | null>(null)
const currentSpeed = ref(10)
const loading = ref(true)
const saving = ref<string | null>(null)
const playingSample = ref<string | null>(null)
let currentAudio: HTMLAudioElement | null = null

const filters = ref<string[]>(['전체'])
const activeFilter = ref('전체')

const filteredVoices = computed(() => {
  if (activeFilter.value === '전체') return voices.value
  return voices.value.filter(v => v.engine === activeFilter.value)
})

const currentVoice = computed(() => voices.value.find(v => v.key === currentVoiceKey.value))

const engineLabel: Record<string, string> = {
  edge: 'edge-tts',
  melo: 'MeloTTS',
  kokoro: 'Kokoro',
}

async function loadVoices() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/voices`)
    const data: VoiceOption[] = await res.json()
    voices.value = data.map(v => ({ ...v, draftSpeed: 10, expanded: false }))

    const engines = Array.from(new Set(data.map(v => v.engine)))
    filters.value = ['전체', ...engines]
  } catch (err) {
    console.error('목소리 목록 로딩 실패:', err)
  }
}

async function loadMySettings() {
  if (!userStore.isLoggedIn) return
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/settings`, {
      credentials: 'include'
    })
    if (!res.ok) return
    const data = await res.json()
    currentVoiceKey.value = data.voice_key
    currentSpeed.value = Math.round(data.speed * 10)

    const voice = voices.value.find(v => v.key === data.voice_key)
    if (voice) voice.draftSpeed = currentSpeed.value
  } catch (err) {
    console.error('내 설정 로딩 실패:', err)
  }
}

async function refreshMySettings() {
  if (!userStore.isLoggedIn) return
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/settings`, {
      credentials: 'include'
    })
    if (!res.ok) return
    const data = await res.json()
    currentVoiceKey.value = data.voice_key
    currentSpeed.value = Math.round(data.speed * 10)
  } catch {}
}

const onFocus = () => refreshMySettings()

onMounted(async () => {
  await loadVoices()
  await loadMySettings()
  loading.value = false
  window.addEventListener('focus', onFocus)
})

onUnmounted(() => {
  window.removeEventListener('focus', onFocus)
})

function toggleExpand(key: string) {
  return async () => {
    const voice = voices.value.find(v => v.key === key)
    if (!voice) return
    voice.expanded = !voice.expanded
    if (voice.expanded) {
      await nextTick()
      updateBubble(key)
    }
  }
}

function calcBubbleLeft(input: HTMLInputElement): number {
  const min = parseFloat(input.min)
  const max = parseFloat(input.max)
  const val = parseFloat(input.value)
  const pct = (val - min) / (max - min)
  const trackW = input.offsetWidth
  return 10 + 10 + pct * (trackW - 20)
}

function updateBubble(key: string) {
  const input = document.getElementById('slider-' + key) as HTMLInputElement
  const bubble = document.getElementById('bubble-' + key)
  if (!input || !bubble) return
  bubble.style.left = calcBubbleLeft(input) + 'px'
}

function onSliderInput(key: string) {
  updateBubble(key)
}

async function apply(key: string) {
  if (!userStore.isLoggedIn) return
  const voice = voices.value.find(v => v.key === key)
  if (!voice) return

  saving.value = key
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ voice_key: key, speed: voice.draftSpeed / 10 }),
    })
    if (!res.ok) throw new Error('적용 실패')

    currentVoiceKey.value = key
    currentSpeed.value = voice.draftSpeed
  } catch (err) {
    console.error('설정 적용 실패:', err)
  } finally {
    saving.value = null
  }
}

function getSpeedLabel(val: number) {
  return (val / 10).toFixed(1) + 'x'
}

function previewVoice(key: string) {
  const voice = voices.value.find(v => v.key === key)

  if (playingSample.value === key) {
    currentAudio?.pause()
    currentAudio = null
    playingSample.value = null
    return
  }
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
  playingSample.value = key
  const audio = new Audio(`${import.meta.env.VITE_API_URL}/samples/${key}.wav`)
  currentAudio = audio
  audio.playbackRate = voice ? voice.draftSpeed / 10 : 1.0
  audio.play()
  audio.onended = () => {
    playingSample.value = null
    currentAudio = null
  }
  audio.onerror = () => {
    playingSample.value = null
    currentAudio = null
  }
}
</script>

<template>
  <div class="voice">
    <div class="page-header">
      <h2>목소리 · 설정</h2>
    </div>

    <div v-if="!userStore.isLoggedIn" class="login-notice">
      설정을 변경하려면 로그인이 필요합니다.
    </div>

    <div v-if="loading" class="loading-notice">불러오는 중...</div>

    <template v-else>
      <div v-if="currentVoice" class="current-card sticky-card">
        <div class="current-left">
          <div class="current-label">현재 사용중</div>
          <div class="current-val">{{ currentVoice.displayName.replace(/^[^\s]+\s/, '') }} · {{ engineLabel[currentVoice.engine] }}</div>
        </div>
        <div class="current-right">
          <div class="current-label">재생 속도</div>
          <div class="current-val">{{ getSpeedLabel(currentSpeed) }}</div>
        </div>
      </div>

      <div class="filter-row">
        <div
          v-for="f in filters"
          :key="f"
          class="filter-tag"
          :class="{ on: activeFilter === f }"
          @click="activeFilter = f"
        >{{ f === '전체' ? '전체' : engineLabel[f] ?? f }}</div>
      </div>

      <div class="voice-list">
        <div
          v-for="voice in filteredVoices"
          :key="voice.key"
          class="voice-card"
          :class="{ selected: voice.key === currentVoiceKey }"
        >
          <div class="voice-top" @click="toggleExpand(voice.key)()">
            <div class="voice-info">
              <div class="voice-name">
                {{ voice.displayName }}
                <span v-if="voice.key === currentVoiceKey" class="selected-badge">사용중</span>
              </div>
              <div class="voice-meta">{{ voice.lang }} · {{ engineLabel[voice.engine] }}</div>
            </div>
            <div class="voice-actions" @click.stop>
              <n-button size="small" @click.stop="previewVoice(voice.key)">
                {{ playingSample === voice.key ? '정지' : '미리듣기' }}
              </n-button>
              <n-button
                size="small"
                type="info"
                :disabled="!userStore.isLoggedIn || saving === voice.key"
                @click="apply(voice.key)"
              >
                {{ saving === voice.key ? '적용 중...' : '적용' }}
              </n-button>
            </div>
          </div>
          <div v-if="voice.expanded" class="speed-section">
            <div class="speed-label">재생 속도</div>
            <div class="slider-outer">
              <div class="speed-ticks">
                <span>0.5x</span><span>1.0x</span><span>1.5x</span><span>2.0x</span>
              </div>
              <div class="slider-wrap">
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  v-model="voice.draftSpeed"
                  class="slider"
                  :id="'slider-' + voice.key"
                  @input="onSliderInput(voice.key)"
                >
                <span class="speed-bubble" :id="'bubble-' + voice.key">
                  {{ getSpeedLabel(voice.draftSpeed) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.voice {
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

.login-notice {
  font-size: 13px;
  color: #aaa;
  background: #fff;
  border: 0.5px solid #e8e8e8;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 16px;
}

.loading-notice {
  font-size: 13px;
  color: #aaa;
  padding: 24px 0;
  text-align: center;
}

.current-card {
  background: #fff;
  border: 0.5px solid #e8e8e8;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.sticky-card {
  position: sticky;
  top: 16px;
  z-index: 10;
}

.current-label {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 4px;
}

.current-val {
  font-size: 14px;
  font-weight: 500;
}

.current-right {
  text-align: right;
}

.filter-row {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.filter-tag {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 8px;
  border: 0.5px solid #e8e8e8;
  background: #fff;
  color: #888;
  cursor: pointer;
}

.filter-tag.on {
  background: #f5f5f5;
  color: #333;
  border-color: #d0d0d0;
  font-weight: 500;
}

.voice-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.voice-card {
  background: #fff;
  border: 0.5px solid #e8e8e8;
  border-radius: 12px;
  padding: 14px 16px;
}

.voice-card.selected {
  border-color: #378add;
}

.voice-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.voice-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.voice-name {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.voice-meta {
  font-size: 12px;
  color: #aaa;
}

.selected-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  background: #e6f1fb;
  color: #185fa5;
  font-weight: 400;
}

.voice-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.speed-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 0.5px solid #f0f0f0;
}

.speed-label {
  font-size: 12px;
  margin-bottom: 6px;
}

.slider-outer {
  padding: 0;
}

.speed-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 4px;
  padding: 0 10px;
}

.slider-wrap {
  position: relative;
  padding-bottom: 22px;
}

.slider {
  width: calc(100% - 20px);
  margin: 0 10px;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  outline: none;
  background: #e0e0e0;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #378add;
  cursor: pointer;
  margin-top: -8px;
}

.slider::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background: #e0e0e0;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #378add;
  cursor: pointer;
  border: none;
}

.slider::-moz-range-track {
  height: 4px;
  border-radius: 2px;
  background: #e0e0e0;
}

.speed-bubble {
  position: absolute;
  bottom: 0;
  font-size: 11px;
  font-weight: 500;
  transform: translateX(-50%);
  pointer-events: none;
  white-space: nowrap;
}
</style>