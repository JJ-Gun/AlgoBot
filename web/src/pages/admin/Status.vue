<script setup lang="ts">
const statuses = [
  { name: 'Discord 봇', status: 'ok' },
  { name: 'MeloTTS 서버', status: 'ok' },
  { name: 'Kokoro 서버', status: 'ok' },
]

const resources = [
  { name: 'CPU 사용률', value: '34%' },
  { name: '메모리 사용량', value: '2.8 GB / 4 GB' },
  { name: '스왑 사용량', value: '0.3 GB / 4 GB' },
]
</script>

<template>
  <div class="status">
    <div class="page-title">봇 상태</div>

    <div class="section-label">서비스</div>
    <div class="card-list">
      <div v-for="s in statuses" :key="s.name" class="card">
        <div class="card-row">
          <span class="card-name">{{ s.name }}</span>
          <span class="status-ok">
            <span class="dot"></span>정상
          </span>
        </div>
      </div>
    </div>

    <div class="section-label">리소스</div>
    <div class="card-list">
      <div v-for="r in resources" :key="r.name" class="card">
        <div class="card-row">
          <span class="card-name">{{ r.name }}</span>
          <span class="card-val">{{ r.value }}</span>
        </div>
      </div>
    </div>
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

.status-ok {
  font-size: 13px;
  color: #18a058;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #18a058;
  display: inline-block;
}

.card-val {
  font-size: 14px;
  font-weight: 500;
}
</style>