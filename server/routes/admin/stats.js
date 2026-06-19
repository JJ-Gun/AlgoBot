import { Router } from 'express'
import db from '../../db/index.js'

const router = Router()

router.get('/', (req, res) => {
  const { filter } = req.query

  const whereClause = filter && filter !== '전체' ? 'WHERE engine = ?' : ''
  const params = filter && filter !== '전체' ? [filter] : []

  const today = db.prepare(`
    SELECT COUNT(*) as count FROM tts_logs
    WHERE date(created_at) = date('now') ${filter && filter !== '전체' ? 'AND engine = ?' : ''}
  `).get(...params)

  const monthly = db.prepare(`
    SELECT COUNT(*) as count FROM tts_logs
    WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') ${filter && filter !== '전체' ? 'AND engine = ?' : ''}
  `).get(...params)

  const guilds = db.prepare(`
    SELECT COUNT(DISTINCT guild_id) as count FROM tts_logs ${whereClause}
  `).get(...params)

  const byVoice = db.prepare(`
    SELECT voice_key, COUNT(*) as count FROM tts_logs ${whereClause}
    GROUP BY voice_key ORDER BY count DESC
  `).all(...params)

  const byHour = db.prepare(`
    SELECT strftime('%H', created_at) as hour, COUNT(*) as count FROM tts_logs ${whereClause}
    GROUP BY hour ORDER BY hour
  `).all(...params)

  const byDay = db.prepare(`
    SELECT date(created_at) as day, COUNT(*) as count FROM tts_logs
    WHERE created_at >= date('now', '-30 days') ${filter && filter !== '전체' ? 'AND engine = ?' : ''}
    GROUP BY day ORDER BY day
  `).all(...params)

  const byGuild = db.prepare(`
    SELECT guild_id, COUNT(*) as count FROM tts_logs ${whereClause}
    GROUP BY guild_id ORDER BY count DESC LIMIT 10
  `).all(...params)

  res.json({
    today: today.count,
    monthly: monthly.count,
    guilds: guilds.count,
    byVoice,
    byHour,
    byDay,
    byGuild,
  })
})

export default router