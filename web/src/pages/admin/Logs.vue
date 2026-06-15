<script setup lang="ts">
const logs = [
  { time: '06-10 14:32', level: 'ERROR', message: 'TTS 생성 실패 · guild: 123456' },
  { time: '06-10 13:15', level: 'ERROR', message: 'Kokoro 서버 응답 없음' },
  { time: '06-09 22:47', level: 'WARN', message: 'CPU 크레딧 80% 소진' },
  { time: '06-09 18:03', level: 'ERROR', message: 'TTS 생성 실패 · guild: 789012' },
  { time: '06-09 10:22', level: 'WARN', message: 'MeloTTS 응답 지연 2.3s' },
  { time: '06-08 09:11', level: 'ERROR', message: 'Discord 봇 연결 끊김' },
]
</script>

<template>
  <div class="logs">
    <div class="page-title">에러 로그</div>
    <div class="log-card">
      <div
        v-for="(log, i) in logs"
        :key="i"
        class="log-row"
      >
        <span class="log-time">{{ log.time }}</span>
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