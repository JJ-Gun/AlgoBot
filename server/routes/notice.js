import { Router } from 'express'
import { readLimiter } from '../middleware/rateLimiters.js'
import db from '../db/index.js'

const router = Router()

router.get('/', readLimiter, (req, res) => {
  const notices = db.prepare('SELECT * FROM notices ORDER BY created_at DESC').all()
  res.json(notices)
})

export default router