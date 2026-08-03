import { Router } from 'express'
import db from '../../db/index.js'

const router = Router()

router.get('/', (req, res) => {
  const { level, year, month, day, limit = 100 } = req.query

  const conditions = []
  const params = []

  if (level) {
    conditions.push('level = ?')
    params.push(level)
  }
  if (year) {
    conditions.push("strftime('%Y', created_at, '+9 hours') = ?")
    params.push(String(year))
  }
  if (month) {
    conditions.push("strftime('%m', created_at, '+9 hours') = ?")
    params.push(String(month).padStart(2, '0'))
  }
  if (day) {
    conditions.push("strftime('%d', created_at, '+9 hours') = ?")
    params.push(String(day).padStart(2, '0'))
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  params.push(limit)

  const logs = db.prepare(`
    SELECT * FROM error_logs ${whereClause}
    ORDER BY created_at DESC LIMIT ?
  `).all(...params)

  res.json(logs)
})

export default router