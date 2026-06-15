import { Router } from 'express'
import { execSync } from 'child_process'

const router = Router()

function getPm2Status(name) {
  try {
    const output = execSync(`pm2 jlist`, { encoding: 'utf-8' })
    const list = JSON.parse(output)
    const proc = list.find(p => p.name === name)
    return proc?.pm2_env?.status === 'online' ? 'ok' : 'error'
  } catch {
    return 'unknown'
  }
}

function getCpuMemory() {
  try {
    const output = execSync(`free -m`, { encoding: 'utf-8' })
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
  } catch {
    return null
  }
}

router.get('/', (req, res) => {
  const bot = getPm2Status('bot')
  const melo = getPm2Status('melo')
  const kokoro = getPm2Status('kokoro')
  const resources = getCpuMemory()

  res.json({ bot, melo, kokoro, resources })
})

export default router