import crypto from 'node:crypto'
import dotenv from 'dotenv'

dotenv.config()

// JWT secret: bat buoc manh (32+ ky tu). Neu thieu/yeu -> sinh tam thoi + canh bao
// (session se mat khi restart, hay set JWT_SECRET that trong .env)
function resolveSecret() {
  const s = process.env.JWT_SECRET
  if (s && s.length >= 32) return { secret: s, ephemeral: false }
  const tmp = crypto.randomBytes(48).toString('hex')
  console.warn(
    '[security] JWT_SECRET thieu hoac < 32 ky tu -> dung secret tam thoi. ' +
    'Hay tao secret manh: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
  )
  return { secret: tmp, ephemeral: true }
}

const { secret, ephemeral } = resolveSecret()
export const JWT_SECRET = secret
export const JWT_SECRET_EPHEMERAL = ephemeral

export const BCRYPT_ROUNDS = 13

export const isProd = process.env.NODE_ENV === 'production'

// Cookie session: httpOnly. Mac dinh SameSite=Lax (cung site: localhost, VPS 1 domain).
// Khi frontend/backend KHAC domain (VD: Vercel + Render) phai dat
// COOKIE_SAMESITE=none — trinh duyet chi chap nhan kem Secure (https).
const sameSiteEnv = (process.env.COOKIE_SAMESITE || 'lax').toLowerCase()
export const cookieSameSite = sameSiteEnv === 'none' ? 'none' : 'lax'
export const cookieSecure = isProd || cookieSameSite === 'none'
export const cookieOptions = {
  httpOnly: true,
  sameSite: cookieSameSite,
  secure: cookieSecure,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngay
}

// CORS: chi cho domain frontend cu the, bat buoc de cookie chay duoc
export const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
