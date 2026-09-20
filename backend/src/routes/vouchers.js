import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { query } from '../db.js'
import { authRequired, adminOnly } from '../middleware/auth.js'

const router = Router()

export function calcDiscount(voucher, subtotal) {
  if (!voucher) return 0
  const v = Number(voucher.value)
  const d = voucher.type === 'percent' ? (subtotal * v) / 100 : v
  return Math.min(Math.round(d * 100) / 100, subtotal)
}

export async function getValidVoucher(code, subtotal) {
  const r = await query('SELECT * FROM vouchers WHERE code=$1', [String(code || '').trim().toUpperCase()])
  const v = r.rows[0]
  if (!v || !v.active) return { valid: false, message: 'Ma giam gia khong ton tai' }
  if (v.expires_at && new Date(v.expires_at) < new Date()) return { valid: false, message: 'Ma da het han' }
  if (Number(v.used_count) >= Number(v.max_uses)) return { valid: false, message: 'Ma da het luot dung' }
  if (subtotal < Number(v.min_order)) return { valid: false, message: `Don toi thieu $${Number(v.min_order).toFixed(2)}` }
  return { valid: true, voucher: v, discount: calcDiscount(v, subtotal) }
}

// Chong do ma: gioi han validate theo IP
const validateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Thu qua nhieu ma, doi 15 phut' },
})

// POST /api/vouchers/validate { code, subtotal }
router.post('/validate', validateLimiter, async (req, res) => {
  try {
    const { code, subtotal } = req.body || {}
    if (!code) return res.status(400).json({ message: 'Thieu ma' })
    const r = await getValidVoucher(code, Number(subtotal) || 0)
    if (!r.valid) return res.status(400).json({ message: r.message })
    const v = r.voucher
    res.json({ code: v.code, type: v.type, value: Number(v.value), min_order: Number(v.min_order), discount: r.discount })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Loi server' })
  }
})

// GET /api/vouchers (admin)
router.get('/', authRequired, adminOnly, async (req, res) => {
  const r = await query('SELECT * FROM vouchers ORDER BY created_at DESC')
  res.json(r.rows)
})

// POST /api/vouchers (admin)
router.post('/', authRequired, adminOnly, async (req, res) => {
  try {
    const { code, type, value, min_order, max_uses, active, expires_at } = req.body || {}
    if (!code || !type || value == null) return res.status(400).json({ message: 'Thieu code/type/value' })
    if (!['percent', 'fixed'].includes(type)) return res.status(400).json({ message: 'type phai la percent|fixed' })
    if (Number(value) <= 0) return res.status(400).json({ message: 'value phai > 0' })
    const r = await query(
      `INSERT INTO vouchers(code,type,value,min_order,max_uses,active,expires_at)
       VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [String(code).trim().toUpperCase(), type, value, min_order || 0, max_uses || 100, active !== false, expires_at || null]
    )
    res.status(201).json(r.rows[0])
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ message: 'Ma da ton tai' })
    console.error(e)
    res.status(500).json({ message: 'Loi server' })
  }
})

// DELETE /api/vouchers/:code (admin)
router.delete('/:code', authRequired, adminOnly, async (req, res) => {
  try {
    await query('DELETE FROM vouchers WHERE code=$1', [String(req.params.code).toUpperCase()])
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Loi server' })
  }
})

export default router
