import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { rateLimit } from 'express-rate-limit'
import { query } from '../db.js'
import { signToken, authRequired, BCRYPT_ROUNDS } from '../middleware/auth.js'
import { cookieOptions } from '../config.js'

const router = Router()

// Chong do mat khau: gioi han so lan thu login/register theo IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Sai qua nhieu lan, thu lai sau 15 phut' },
})
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Tao tai khoan qua nhieu, thu lai sau 1 gio' },
})

function setSession(res, user) {
  const token = signToken(user)
  res.cookie('token', token, cookieOptions)
  return token
}

// POST /api/auth/register { name, email, password }
router.post('/register', registerLimiter, async (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) return res.status(400).json({ message: 'Thieu name/email/password' })
  if (String(password).length < 6) return res.status(400).json({ message: 'Mat khau toi thieu 6 ky tu' })
  try {
    const exists = await query('SELECT id FROM users WHERE email=$1', [email])
    if (exists.rowCount > 0) return res.status(409).json({ message: 'Email da ton tai' })
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    const r = await query(
      'INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,role,created_at',
      [name, email, hash]
    )
    const user = r.rows[0]
    const token = setSession(res, user)
    res.status(201).json({ user, token })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Loi server' })
  }
})

// POST /api/auth/login { email, password }
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ message: 'Thieu email/password' })
  try {
    const r = await query('SELECT * FROM users WHERE email=$1', [email])
    const user = r.rows[0]
    // So sanh hang so thoi gian ke ca khi user khong ton tai (chong user-enumeration)
    const DUMMY_HASH = bcrypt.hashSync('no-such-user-dummy', 4)
    const hash = user?.password_hash || DUMMY_HASH
    const ok = await bcrypt.compare(password, hash)
    if (!user || !ok) return res.status(401).json({ message: 'Sai email hoac mat khau' })
    const safe = { id: user.id, name: user.name, email: user.email, role: user.role }
    const token = setSession(res, safe)
    res.json({ user: safe, token })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Loi server' })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: undefined })
  res.json({ ok: true })
})

// GET /api/auth/me (can login)
router.get('/me', authRequired, async (req, res) => {
  const r = await query('SELECT id,name,email,role,created_at FROM users WHERE id=$1', [req.user.id])
  res.json(r.rows[0] || null)
})

// PUT /api/auth/me { name } — sua thong tin ca nhan
router.put('/me', authRequired, async (req, res) => {
  try {
    const { name } = req.body || {}
    if (!name || !String(name).trim()) return res.status(400).json({ message: 'Ten khong duoc trong' })
    const r = await query(
      'UPDATE users SET name=$1 WHERE id=$2 RETURNING id,name,email,role,created_at',
      [String(name).trim().slice(0, 100), req.user.id]
    )
    res.json(r.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Loi server' })
  }
})

// PUT /api/auth/password { currentPassword, newPassword } — doi mat khau
router.put('/password', authRequired, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {}
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Thieu mat khau' })
    if (String(newPassword).length < 6) return res.status(400).json({ message: 'Mat khau moi toi thieu 6 ky tu' })
    const r = await query('SELECT * FROM users WHERE id=$1', [req.user.id])
    const ok = await bcrypt.compare(currentPassword, r.rows[0].password_hash)
    if (!ok) return res.status(401).json({ message: 'Mat khau hien tai sai' })
    const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
    await query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.user.id])
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Loi server' })
  }
})

export default router
