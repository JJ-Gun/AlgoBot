import jwt from 'jsonwebtoken'
import { logError } from '../db/logger.js'

export function authMiddleware(req, res, next) {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: '인증이 필요합니다.' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    if (err.name !== 'TokenExpiredError') {
      logError(`인증 실패 - 유효하지 않은 토큰: ${err.message} (경로: ${req.originalUrl})`, 'WARN')
    }
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' })
  }
}