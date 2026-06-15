import { Router } from 'express'
import db from '../db/index.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware)

router.get('/settings', (req, res) => {
  const user = db.prepare('SELECT voice_key, speed FROM users WHERE id = ?').get(req.user.id)
  if (!user) return res.status(404).json({ error: '유저를 찾을 수 없습니다.' })
  res.json(user)
})

router.put('/settings', (req, res) => {
  const { voice_key, speed } = req.body
  db.prepare('UPDATE users SET voice_key = ?, speed = ? WHERE id = ?')
    .run(voice_key, speed, req.user.id)
  res.json({ success: true })
})

export default router