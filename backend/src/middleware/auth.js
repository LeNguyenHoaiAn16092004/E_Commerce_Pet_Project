import jwt from 'jsonwebtoken'
import { JWT_SECRET, BCRYPT_ROUNDS } from '../config.js'

export { BCRYPT_ROUNDS }

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Doc token tu httpOnly cookie (uu tien), fallback Authorization header cho API client cu
export function authRequired(req, res, next) {
  const fromCookie = req.cookies?.token
  const h = req.headers.authorization || ''
  const fromHeader = h.startsWith('Bearer ') ? h.slice(7) : null
  const token = fromCookie || fromHeader
  if (!token) return res.status(401).json({ message: 'Chua dang nhap' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ message: 'Phien dang nhap het han' })
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Can quyen admin' })
  next()
}
