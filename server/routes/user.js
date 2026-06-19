import { Router } from 'express'
import db from '../db/index.js'
import { authMiddleware } from '../middleware/auth.js'
import { VOICES } from '../../src/config.js'

const router = Router()

router.get('/voices', (req, res) => {
  const voices = Object.entries(VOICES).map(([key, v]) => ({
    key,
    lang: v.lang,
    displayName: v.displayName,
    engine: v.type,
  }))
  res.json(voices)
})

router.use(authMiddleware)

router.get('/settings', (req, res) => {
  const user = db.prepare('SELECT voice_key, speed FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ error: '유저를 찾을 수 없습니다.' })
  res.json(user)
})

router.put('/settings', (req, res) => {
  const { voice_key, speed } = req.body
  if (!VOICES[voice_key]) return res.status(400).json({ error: '존재하지 않는 목소리입니다.' })
  if (typeof speed !== 'number' || speed < 0.5 || speed > 2.0) {
    return res.status(400).json({ error: '속도는 0.5~2.0 사이여야 합니다.' })
  }
  db.prepare('UPDATE users SET voice_key = ?, speed = ? WHERE id = ?')
    .run(voice_key, speed, req.user.id)
  res.json({ success: true })
})

export default router