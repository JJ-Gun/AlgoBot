import { Router } from 'express'
import db from '../db/index.js'
import { authMiddleware } from '../middleware/auth.js'
import { readLimiter, writeLimiter } from '../middleware/rateLimiters.js'

const router = Router()

router.get('/', readLimiter, (req, res) => {
  const inquiries = db.prepare(`
    SELECT id, type, title, content, reply, status, created_at
    FROM inquiries ORDER BY created_at DESC
  `).all()
  res.json(inquiries)
})

router.post('/', authMiddleware, writeLimiter, (req, res) => {
  const { type, title, content } = req.body
  if (!type || !title || !content) return res.status(400).json({ error: '필수 항목을 입력해 주세요.' })

  db.prepare(`
    INSERT INTO inquiries (user_id, username, type, title, content)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.user.id, req.user.username, type, title, content)

  res.json({ success: true })
})

export default router