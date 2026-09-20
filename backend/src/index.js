import express from 'express'
import crypto from 'node:crypto'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { doubleCsrf } from 'csrf-csrf'
import { pool } from './db.js'
import { JWT_SECRET, allowedOrigins, isProd } from './config.js'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import voucherRoutes from './routes/vouchers.js'
import reviewRoutes from './routes/reviews.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.set('trust proxy', 1)
app.disable('x-powered-by')

// Header bao mat. crossOriginResourcePolicy de 'cross-origin' vi day la JSON API
// duoc frontend goi cross-origin (khac port); CORP 'same-origin' se chan fetch.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

// CORS: chi domain frontend cu the + cho phep cookie
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(cookieParser())
app.use(express.json({ limit: '100kb' }))

// Cookie dinh danh thiet bi on dinh cho CSRF (khong doi khi login/logout)
app.use((req, res, next) => {
  let sid = req.cookies?.sid
  if (!sid) {
    sid = crypto.randomBytes(16).toString('hex')
    res.cookie('sid', sid, { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge: 365 * 24 * 60 * 60 * 1000 })
    req.cookies = { ...req.cookies, sid }
  }
  next()
})
const {
  invalidCsrfTokenError,
  generateCsrfToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => JWT_SECRET,
  // Gan CSRF token voi sid on dinh (khong dung JWT vi JWT doi sau khi login)
  getSessionIdentifier: (req) => req.cookies?.sid || req.ip || 'anonymous',
  cookieName: 'csrf_token',
  cookieOptions: { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/' },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
})

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true, db: 'connected' })
  } catch (e) {
    res.status(500).json({ ok: false, db: 'disconnected', error: e.message })
  }
})

// Frontend lay CSRF token truoc khi POST/PUT/DELETE
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: generateCsrfToken(req, res) })
})

// Tat ca POST/PUT/PATCH/DELETE duoi /api deu can CSRF token hop le
app.use('/api', (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next()
  return doubleCsrfProtection(req, res, next)
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/vouchers', voucherRoutes)
app.use('/api', reviewRoutes)

// Cau hinh public cho frontend (QR VietQR, khong lo secret)
app.get('/api/config', (req, res) => {
  res.json({
    vietqr: {
      bank: process.env.VIETQR_BANK || '',
      account: process.env.VIETQR_ACCOUNT || '',
      name: process.env.VIETQR_NAME || 'SHOPFUN',
    },
    usdToVnd: 25000,
  })
})

app.use((req, res) => res.status(404).json({ message: 'API khong ton tai' }))

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err === invalidCsrfTokenError) {
    return res.status(403).json({ message: 'CSRF token khong hop le', code: 'EBADCSRFTOKEN' })
  }
  console.error(err)
  res.status(500).json({ message: 'Loi server' })
})

app.listen(PORT, () => console.log(`[backend] chay o http://localhost:${PORT}`))
