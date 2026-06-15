<script setup lang="ts">
import { ref } from 'vue'
import { Chart, registerables } from 'chart.js'
import { onMounted } from 'vue'

Chart.register(...registerables)

const filter = ref('전체')
const filters = ['전체', 'edge-tts', 'MeloTTS', 'Kokoro']

onMounted(() => {
  const donut = new Chart(document.getElementById('donut-chart') as HTMLCanvasElement, {
    type: 'doughnut',
    data: {
      labels: ['선희', '인준', 'Heart', '로컬', '기타'],
      datasets: [{
        data: [40, 25, 20, 10, 5],
        backgroundColor: ['#378add', '#5DCAA5', '#D85A30', '#7F77DD', '#888780'],
        borderWidth: 0,
      }]
    },
    options: { plugins: { legend: { position: 'right' } }, cutout: '65%' }
  })

  const bar = new Chart(document.getElementById('bar-chart') as HTMLCanvasElement, {
    type: 'bar',
    data: {
      labels: ['0', '3', '6', '9', '12', '15', '18', '21'],
      datasets: [{
        data: [5, 2, 8, 45, 62, 38, 80, 55],
        backgroundColor: '#378add',
        borderRadius: 4,
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  })

  const line = new Chart(document.getElementById('line-chart') as HTMLCanvasElement, {
    type: 'line',
    data: {
      labels: Array.from({ length: 30 }, (_, i) => `${i + 1}일`),
      datasets: [{
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 200 + 50)),
        borderColor: '#378add',
        backgroundColor: 'rgba(55,138,221,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  })
})
</script>

<template>
  <div class="dashboard">
    <div class="page-title">사용량</div>

    <div class="metrics">
      <div class="metric">
        <div class="metric-label">오늘 요청</div>
        <div class="metric-val">284</div>
      </div>
      <div class="metric">
        <div class="metric-label">이번 달</div>
        <div class="metric-val">5,421</div>
      </div>
      <div class="metric">
        <div class="metric-label">서버 수</div>
        <div class="metric-val">12</div>
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
      >{{ f }}</div>
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