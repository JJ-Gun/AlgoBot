import { Router } from 'express'
import db from '../../db/index.js'

const router = Router()

router.get('/', (req, res) => {
  const notices = db.prepare('SELECT * FROM notices ORDER BY created_at DESC').all()
  res.json(notices)
})

router.post('/', (req, res) => {
  const { title, content } = req.body
  if (!title || !content) return res.status(400).json({ error: '필수 항목을 입력해 주세요.' })

  db.prepare('INSERT INTO notices (title, content) VALUES (?, ?)').run(title, content)
  res.json({ success: true })
})

router.put('/:id', (req, res) => {
  const { title, content } = req.body
  if (!title || !content) return res.status(400).json({ error: '필수 항목을 입력해 주세요.' })

  db.prepare(`
    UPDATE notices SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ?
  `).run(title, content, req.params.id)
  res.json({ success: true })
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM notices WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router