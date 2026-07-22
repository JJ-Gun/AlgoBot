import { Router } from 'express'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import db from '../db/index.js'
import { logError } from '../db/logger.js'

const router = Router()

function getOAuthConfig() {
  const isDev = process.env.NODE_ENV === 'development'
  return {
    clientId: isDev ? process.env.DEV_DISCORD_CLIENT_ID : process.env.DISCORD_CLIENT_ID,
    clientSecret: isDev ? process.env.DEV_DISCORD_CLIENT_SECRET : process.env.DISCORD_CLIENT_SECRET,
    redirectUri: isDev ? process.env.DEV_DISCORD_REDIRECT_URI : process.env.DISCORD_REDIRECT_URI,
  }
}

router.get('/discord', (req, res) => {
  const { clientId, redirectUri } = getOAuthConfig()
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify',
    prompt: 'none',
  })
  res.redirect(`https://discord.com/oauth2/authorize?${params}`)
})

router.get('/discord/callback', async (req, res) => {
  const { code } = req.query
  if (!code) return res.status(400).json({ error: 'code가 없습니다.' })

  const { clientId, clientSecret, redirectUri } = getOAuthConfig()

  try {
    const tokenRes = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })

    const { access_token } = tokenRes.data

    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` }
    })

    const { id, username, avatar } = userRes.data
    const is_admin = id === process.env.ADMIN_DISCORD_ID ? 1 : 0

    db.prepare(`
      INSERT INTO users (id, username, avatar, is_admin)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET username=excluded.username, avatar=excluded.avatar
    `).run(id, username, avatar, is_admin)

    const token = jwt.sign({ id, username, avatar, is_admin }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.cookie(`token`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    res.redirect(`${process.env.WEB_URL}/auth/callback`)
  } catch (err) {
    const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message
    logError(`Discord OAuth 로그인 실패: ${detail}`)
    res.status(500).json({ error: 'OAuth 처리 중 오류가 발생했습니다.' })
  }
})

router.get('/me', (req, res) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: '인증이 필요합니다.' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id)
    if (!user) {
      return res.status(404).json({ error: '유저를 찾을 수 없습니다.' })
    }
    res.json(user)
  } catch (err) {
    res.status(401).json({ error: '유효하지 않은 토큰입니다.' })
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ success: true })
})

export default router