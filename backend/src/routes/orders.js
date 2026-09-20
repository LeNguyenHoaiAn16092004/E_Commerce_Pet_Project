import { Router } from 'express'
import { query } from '../db.js'
import { authRequired } from '../middleware/auth.js'
import { getValidVoucher } from './vouchers.js'

const router = Router()

// POST /api/orders { items:[{product_id,qty}], address, city, zip, voucherCode, payment_method } (can login)
router.post('/', authRequired, async (req, res) => {
  const { items, address, city, zip, voucherCode, payment_method } = req.body || {}
  if (!items?.length) return res.status(400).json({ message: 'Gio hang rong' })
  const payMethod = ['cod', 'vietqr'].includes(payment_method) ? payment_method : 'cod'
  try {
    const ids = items.map((i) => i.product_id)
    const pr = await query(`SELECT id, price, category FROM products WHERE id = ANY($1)`, [ids])
    const priceMap = Object.fromEntries(pr.rows.map((p) => [p.id, Number(p.price)]))
    const catMap = Object.fromEntries(pr.rows.map((p) => [p.id, p.category]))
    let subtotal = 0
    let apparelSubtotal = 0
    let apparelQty = 0
    for (const i of items) {
      if (!priceMap[i.product_id]) return res.status(400).json({ message: `San pham khong ton tai: ${i.product_id}` })
      const line = priceMap[i.product_id] * (i.qty || 1)
      subtotal += line
      if (catMap[i.product_id] === 'apparel') { apparelSubtotal += line; apparelQty += (i.qty || 1) }
    }
    // Combo dong: >=3 mon apparel -> giam 15% tien hang apparel
    let bundleDiscount = 0
    if (apparelQty >= 3) bundleDiscount = Math.round(apparelSubtotal * 0.15 * 100) / 100
    // Voucher do server tu tinh (khong tin client)
    let discount = 0
    let code = null
    if (voucherCode) {
      const v = await getValidVoucher(voucherCode, subtotal)
      if (!v.valid) return res.status(400).json({ message: v.message })
      discount = v.discount
      code = v.voucher.code
      await query('UPDATE vouchers SET used_count = used_count + 1 WHERE code=$1', [code])
    }
    const total = Math.round((subtotal - discount - bundleDiscount) * 100) / 100
    const order = await query(
      'INSERT INTO orders(user_id,total,address,city,zip,status,voucher_code,discount,bundle_discount,payment_method,payment_status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [req.user.id, total, address || null, city || null, zip || null, 'Processing', code, discount, bundleDiscount, payMethod, 'pending']
    )
    const o = order.rows[0]
    for (const i of items) {
      await query('INSERT INTO order_items(order_id,product_id,qty,price) VALUES($1,$2,$3,$4)',
        [o.id, i.product_id, i.qty || 1, priceMap[i.product_id]])
    }
    res.status(201).json({ ...o, items })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Loi server' })
  }
})

// GET /api/orders (don cua minh)
router.get('/', authRequired, async (req, res) => {
  const r = await query('SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id])
  res.json(r.rows)
})

// GET /api/orders/:id (chi tiet + items)
router.get('/:id', authRequired, async (req, res) => {
  const r = await query('SELECT * FROM orders WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id])
  if (!r.rows[0]) return res.status(404).json({ message: 'Khong tim thay don' })
  const items = await query(
    `SELECT oi.*, p.name, p.image FROM order_items oi JOIN products p ON p.id=oi.product_id WHERE oi.order_id=$1`,
    [req.params.id]
  )
  res.json({ ...r.rows[0], items: items.rows })
})

export default router
