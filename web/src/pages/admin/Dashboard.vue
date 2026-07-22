<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useUserStore } from '@/stores/user'

Chart.register(...registerables)

const userStore = useUserStore()

const filter = ref('전체')
const filters = ['전체', 'edge', 'melo', 'kokoro']
const engineLabel: Record<string, string> = {
  전체: '전체',
  edge: 'edge-tts',
  melo: 'MeloTTS',
  kokoro: 'Kokoro',
}

const loading = ref(true)
const todayCount = ref(0)
const monthlyCount = ref(0)
const guildCount = ref(0)

let donutChart: Chart | null = null
let barChart: Chart | null = null
let lineChart: Chart | null = null

async function loadStats() {
  loading.value = true
  try {
    const params = filter.value !== '전체' ? `?filter=${filter.value}` : ''
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/stats${params}`, {
      credentials: 'include'
    })
    if (!res.ok) throw new Error('통계 로딩 실패')
    const data = await res.json()

    todayCount.value = data.today
    monthlyCount.value = data.monthly
    guildCount.value = data.guilds

    renderDonut(data.byVoice)
    renderBar(data.byHour)
    renderLine(data.byDay)
  } catch (err) {
    console.error('대시보드 데이터 로딩 실패:', err)
  } finally {
    loading.value = false
  }
}

function renderDonut(byVoice: { voice_key: string; count: number }[]) {
  donutChart?.destroy()
  const canvas = document.getElementById('donut-chart') as HTMLCanvasElement
  if (!canvas) return
  donutChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: byVoice.map(v => v.voice_key),
      datasets: [{
        data: byVoice.map(v => v.count),
        backgroundColor: ['#378add', '#5DCAA5', '#D85A30', '#7F77DD', '#888780', '#E0B23A'],
        borderWidth: 0,
      }]
    },
    options: { plugins: { legend: { position: 'right' } }, cutout: '65%' }
  })
}

function renderBar(byHour: { hour: string; count: number }[]) {
  barChart?.destroy()
  const canvas = document.getElementById('bar-chart') as HTMLCanvasElement
  if (!canvas) return
  const hourMap = new Map(byHour.map(h => [h.hour, h.count]))
  const labels = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const data = labels.map(h => hourMap.get(h) ?? 0)

  barChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data, backgroundColor: '#378add', borderRadius: 4 }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  })
}

function renderLine(byDay: { day: string; count: number }[]) {
  lineChart?.destroy()
  const canvas = document.getElementById('line-chart') as HTMLCanvasElement
  if (!canvas) return
  lineChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: byDay.map(d => d.day.slice(5)),
      datasets: [{
        data: byDay.map(d => d.count),
        borderColor: '#378add',
        backgroundColor: 'rgba(55,138,221,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#378add',
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  })
}

onMounted(loadStats)
watch(filter, loadStats)
</script>

<template>
  <div class="dashboard">
    <div class="page-title">사용량</div>

    <div class="metrics">
      <div class="metric">
        <div class="metric-label">오늘 요청</div>
        <div class="metric-val">{{ todayCount }}</div>
      </div>
      <div class="metric">
        <div class="metric-label">이번 달</div>
        <div class="metric-val">{{ monthlyCount }}</div>
      </div>
      <div class="metric">
        <div class="metric-label">서버 수</div>
        <div class="metric-val">{{ guildCount }}</div>
      </div>
    </div>

    <div class="filter-row">
      <span class="filter-label">필터</span>
      <div
        v-for="f in filters"
        :key="f"
        class="filter-tag"
        :class="{ on: filter === f }"
        @click="filter = f"
      >{{ engineLabel[f] }}</div>
    </div>

    <div class="grid2">
      <div class="chart-card">
        <div class="chart-title">목소리별 비율</div>
        <canvas id="donut-chart" height="160"></canvas>
      </div>
      <div class="chart-card">
        <div class="chart-title">시간대별 사용량</div>
        <canvas id="bar-chart" height="160"></canvas>
      </div>
    </div>

    <div class="chart-card">
      <div class="chart-title">일별 추이 (최근 30일)</div>
      <canvas id="line-chart" height="100"></canvas>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 20px;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.metric {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
}

.metric-label {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 4px;
}

.metric-val {
  font-size: 22px;
  font-weight: 500;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.filter-label {
  font-size: 12px;
  color: #aaa;
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

.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.chart-card {
  background: #fff;
  border: 0.5px solid #e8e8e8;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
}

.chart-card:last-child {
  margin-bottom: 0;
}

.chart-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 12px;
}
</style>