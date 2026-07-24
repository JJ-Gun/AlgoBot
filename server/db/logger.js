import db from './index.js'

export function logError(message, level = 'ERROR', stack = null) {
  console.error(`[${level}] ${message}`)
  try {
    db.prepare('INSERT INTO error_logs (level, message, stack) VALUES (?, ?, ?)').run(level, message, stack)
  } catch (err) {
    console.error('에러 로그 기록 실패:', err)
  }
}

export function logWarn(message) {
  logError(message, 'WARN')
}