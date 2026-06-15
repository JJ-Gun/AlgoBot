import { Router } from 'express'
import db from '../../db/index.js'

const router = Router()

router.get('/', (req, res) => {
  const { status } = req.query
  const whereClause = status ? 'WHERE status = ?' : ''
  const params = status ? [status] : []

  const inquiries = db.prepare(`
    SELECT * FROM inquiries ${whereClause} ORDER BY created_at DESC
  `).all(...params)

  res.json(inquiries)
})

router.put('/:id', (req, res) => {
  const { reply, status } = req.body

  db.prepare(`
    UPDATE inquiries SET reply = ?, status = ?, updated_at = datetime('now') WHERE id = ?
  `).run(reply, status, req.params.id)

  res.json({ success: true })
})

export default router