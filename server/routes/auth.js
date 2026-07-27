import { Router } from 'express'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import db from '../db/index.js'
import { logError } from '../db/logger.js'
import crypto from 'crypto'

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
  const state = crypto.randomBytes(16).toString('hex')

  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000,
  })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify',
    prompt: 'none',
    state,
  })
  res.redirect(`https://discord.com/oauth2/authorize?${params}`)
})

router.get('/discord/callback', async (req, res) => {
  const { code, state } = req.query
  const savedState = req.cookies?.oauth_state
  res.clearCookie('oauth_state')

  if (!code) return res.status(400).json({ error: 'code가 없습니다.' })
  if (!state || !savedState || state !== savedState) {
    logError(`OAuth state 불일치 - 위조된 요청 의심 (IP: ${req.ip})`, 'WARN')
    return res.status(400).json({ error: '잘못된 접근입니다.' })
  }

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
    logError(`Discord OAuth 로그인 실패: ${detail}`, 'ERROR', err.stack)
    res.status(500).json({ error: 'OAuth 처리 중 오류가 발생했습니다.' })
  }
})

router.get('/me', (req, res) => {
  const token = req.cookies?.token
  if (!token) return res.status(200).json(null)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id)
    if (!user) {
      logError(`/auth/me: 존재하지 않는 유저 조회 시도 (id: ${decoded.id})`, 'WARN')
      return res.status(200).json(null)
    }
    res.json(user)
  } catch (err) {
    if (err.name !== 'TokenExpiredError') {
      logError(`/auth/me: 유효하지 않은 토큰 - ${err.message}`, 'WARN', err.stack)
    }
    res.status(200).json(null)
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ success: true })
})

export default router