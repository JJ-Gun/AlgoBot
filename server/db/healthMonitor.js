import { execSync } from 'child_process'
import { logError, logWarn } from './logger.js'

const CHECK_INTERVAL = 10_000 // 10초

const state = {
  bot: 'unknown',
  melo: 'unknown',
  kokoro: 'unknown',
  resources: null,
  lastChecked: null,
}

async function pingHealth(url, timeoutMs = 3000) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    return res.ok
  } catch {
    return false
  }
}

function logStatusChange(name, prevStatus, newStatus) {
  if (prevStatus === newStatus) return
  if (prevStatus === 'unknown') return // 최초 체크는 로그 남기지 않음

  if (newStatus === 'ok') {
    logWarn(`${name} 서비스가 정상으로 복구되었습니다.`)
  } else {
    logError(`${name} 서비스에 연결할 수 없습니다.`)
  }
}

async function checkAll() {
  const botPort = process.env.BOT_HEALTH_PORT || 3001
  const meloPort = process.env.MELO_PORT || 5050
  const kokoroPort = process.env.KOKORO_PORT || 5051

  const [botOk, meloOk, kokoroOk] = await Promise.all([
    pingHealth(`http://127.0.0.1:${botPort}/health`),
    pingHealth(`http://127.0.0.1:${meloPort}/health`),
    pingHealth(`http://127.0.0.1:${kokoroPort}/health`),
  ])

  const newBot = botOk ? 'ok' : 'error'
  const newMelo = meloOk ? 'ok' : 'error'
  const newKokoro = kokoroOk ? 'ok' : 'error'

  logStatusChange('Discord 봇', state.bot, newBot)
  logStatusChange('MeloTTS', state.melo, newMelo)
  logStatusChange('Kokoro', state.kokoro, newKokoro)

  state.bot = newBot
  state.melo = newMelo
  state.kokoro = newKokoro
  state.resources = getResources()
  state.lastChecked = new Date().toISOString()
}

function getResources() {
  if (process.platform !== 'linux') return null
  try {
    const output = execSync('free -m', { encoding: 'utf-8' })
    const lines = output.trim().split('\n')
    const mem = lines[1].split(/\s+/)
    const total = parseInt(mem[1])
    const used = parseInt(mem[2])
    const swap = lines[2].split(/\s+/)
    const swapTotal = parseInt(swap[1])
    const swapUsed = parseInt(swap[2])

    const cpuOutput = execSync(`top -bn1 | grep 'Cpu(s)'`, { encoding: 'utf-8' })
    const cpuMatch = cpuOutput.match(/(\d+\.\d+)\s+id/)
    const cpuIdle = cpuMatch ? parseFloat(cpuMatch[1]) : 0
    const cpuUsed = (100 - cpuIdle).toFixed(1)

    return { total, used, swapTotal, swapUsed, cpuUsed }
  } catch (err) {
    logError(`리소스 정보 조회 실패: ${err.message}`)
    return null
  }
}

export function startHealthMonitor() {
  checkAll()
  setInterval(checkAll, CHECK_INTERVAL)
}

export function getHealthState() {
  return state
}