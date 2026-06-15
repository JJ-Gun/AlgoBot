import { Router } from 'express'
import db from '../../db/index.js'

const router = Router()

router.get('/', (req, res) => {
  const { level, limit = 50 } = req.query

  const whereClause = level ? 'WHERE level = ?' : ''
  const params = level ? [level, limit] : [limit]

  const logs = db.prepare(`
    SELECT * FROM error_logs ${whereClause}
    ORDER BY created_at DESC LIMIT ?
  `).all(...params)

  res.json(logs)
})

export default router