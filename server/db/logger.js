import db from './index.js'

export function logError(message, level = 'ERROR') {
  console.error(`[${level}] ${message}`)
  try {
    db.prepare('INSERT INTO error_logs (level, message) VALUES (?, ?)').run(level, message)
  } catch (err) {
    console.error('에러 로그 기록 실패:', err)
  }
}

export function logWarn(message) {
  logError(message, 'WARN')
}