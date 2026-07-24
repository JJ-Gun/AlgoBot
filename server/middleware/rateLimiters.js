import rateLimit, { ipKeyGenerator} from 'express-rate-limit'

function keyByUserOrIp(req) {
  return req.user?.id ?? ipKeyGenerator(req.ip)
}

export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' },
})

export const readLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 500,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByUserOrIp,
  message: { error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' },
})

export const writeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByUserOrIp,
  message: { error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' },
})