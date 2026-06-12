<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

interface Voice {
  id: string
  name: string
  meta: string
  selected: boolean
  appliedSpeed: number
  draftSpeed: number
  expanded: boolean
}

const voices = ref<Voice[]>([
  { id: 'ko-InJoon', name: '인준', meta: '한국어 남성 · edge-tts', selected: true, appliedSpeed: 10, draftSpeed: 10, expanded: false },
  { id: 'ko-SunHi', name: '선희', meta: '한국어 여성 · edge-tts', selected: false, appliedSpeed: 10, draftSpeed: 10, expanded: false },
  { id: 'ko-Hyunsu', name: '현수', meta: '한국어 남성 · edge-tts', selected: false, appliedSpeed: 10, draftSpeed: 10, expanded: false },
  { id: 'ko-local', name: '로컬', meta: '한국어 · MeloTTS', selected: false, appliedSpeed: 10, draftSpeed: 10, expanded: false },
  { id: 'af_heart', name: 'Heart', meta: '영어 여성 · Kokoro', selected: false, appliedSpeed: 10, draftSpeed: 10, expanded: false },
  { id: 'af_bella', name: 'Bella', meta: '영어 여성 · Kokoro', selected: false, appliedSpeed: 10, draftSpeed: 10, expanded: false },
  { id: 'am_adam', name: 'Adam', meta: '영어 남성 · Kokoro', selected: false, appliedSpeed: 10, draftSpeed: 10, expanded: false },
  { id: 'am_michael', name: 'Michael', meta: '영어 남성 · Kokoro', selected: false, appliedSpeed: 10, draftSpeed: 10, expanded: false },
])

const filters = ['전체', 'edge-tts', 'MeloTTS', 'Kokoro']
const activeFilter = ref('전체')

const filteredVoices = computed(() => {
  if (activeFilter.value === '전체') return voices.value
  return voices.value.filter(v => v.meta.includes(activeFilter.value))
})

const currentVoice = computed(() => voices.value.find(v => v.selected))

const PAD = 8

const THUMB_W = 20

function calcBubbleLeft(input: HTMLInputElement): number {
  const min = parseFloat(input.min)
  const max = parseFloat(input.max)
  const val = parseFloat(input.value)
  const pct = (val - min) / (max - min)
  const trackW = input.offsetWidth
  return 10 + 10 + pct * (trackW - 20)
}

function updateBubble(voiceId: string) {
  const input = document.getElementById('slider-' + voiceId) as HTMLInputElement
  const bubble = document.getElementById('bubble-' + voiceId)
  if (!input || !bubble) return
  bubble.style.left = calcBubbleLeft(input) + 'px'
}

async function toggleExpand(id: string) {
  const voice = voices.value.find(v => v.id === id)
  if (!voice) return
  voice.expanded = !voice.expanded
  if (voice.expanded) {
    await nextTick()
    updateBubble(id)
  }
}

function onSliderInput(event: Event, voiceId: string) {
  updateBubble(voiceId)
}

function apply(id: string) {
  voices.value.forEach(v => v.selected = false)
  const voice = voices.value.find(v => v.id === id)
  if (voice) {
    voice.selected = true
    voice.appliedSpeed = voice.draftSpeed
  }
}

function getSpeedLabel(val: number) {
  return (val / 10).toFixed(1) + 'x'
}
</script>

<template>
  <div class="voice">
    <div class="page-header">
      <h2>목소리 · 설정</h2>
    </div>

    <div class="current-card sticky-card">
      <div class="current-left">
        <div class="current-label">현재 사용중</div>
        <div class="current-val">{{ currentVoice?.name }} · {{ currentVoice?.meta }}</div>
      </div>
      <div class="current-right">
        <div class="current-label">재생 속도</div>
        <div class="current-val">{{ getSpeedLabel(currentVoice?.appliedSpeed ?? 10) }}</div>
      </div>
    </div>

    <div class="filter-row">
      <div
        v-for="f in filters"
        :key="f"
        class="filter-tag"
        :class="{ on: activeFilter === f }"
        @click="activeFilter = f"
      >{{ f }}</div>
    </div>

    <div class="voice-list">
      <div
        v-for="voice in filteredVoices"
        :key="voice.id"
        class="voice-card"
        :class="{ selected: voice.selected }"
      >
        <div class="voice-top" @click="toggleExpand(voice.id)">
          <div class="voice-info">
            <div class="voice-name">
              {{ voice.name }}
              <span v-if="voice.selected" class="selected-badge">사용중</span>
            </div>
            <div class="voice-meta">{{ voice.meta }}</div>
          </div>
          <div class="voice-actions" @click.stop>
            <n-button size="small">미리듣기</n-button>
            <n-button size="small" type="info" @click="apply(voice.id)">적용</n-button>
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
                :id="'slider-' + voice.id"
                @input="onSliderInput($event, voice.id)"
              >
              <span class="speed-bubble" :id="'bubble-' + voice.id">
                {{ getSpeedLabel(voice.draftSpeed) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
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