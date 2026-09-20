import { Router } from 'express'
import { query } from '../db.js'
import { authRequired, adminOnly } from '../middleware/auth.js'

const router = Router()

// GET /api/products?cat=&q=&max=
router.get('/', async (req, res) => {
  const { cat, q, max } = req.query
  const conds = []
  const vals = []
  if (cat && cat !== 'all') { vals.push(cat); conds.push(`category = $${vals.length}`) }
  if (q) { vals.push(`%${q}%`); conds.push(`(name ILIKE $${vals.length} OR description ILIKE $${vals.length})`) }
  if (max) { vals.push(Number(max)); conds.push(`price <= $${vals.length}`) }
  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : ''
  try {
    const r = await query(`SELECT * FROM products ${where} ORDER BY created_at DESC`, vals)
    res.json(r.rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Loi server' })
  }
})

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const r = await query('SELECT * FROM products WHERE id=$1', [req.params.id])
  if (!r.rows[0]) return res.status(404).json({ message: 'Khong tim thay san pham' })
  res.json(r.rows[0])
})

// POST /api/products (admin)
router.post('/', authRequired, adminOnly, async (req, res) => {
  const { id, name, price, old_price, rating, reviews, category, badge, image, description, stock } = req.body || {}
  if (!name || price == null || !category) return res.status(400).json({ message: 'Thieu name/price/category' })
  if (price < 0) return res.status(400).json({ message: 'Gia khong hop le' })
  const pid = (typeof id === 'string' && id.trim()) || 'p' + Date.now().toString(36)
  try {
    const r = await query(
      `INSERT INTO products(id,name,price,old_price,rating,reviews,category,badge,image,description,stock)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [pid, name.trim(), price, old_price || null, rating || 0, reviews || 0, category, badge || null, image || null, description || null, stock ?? 100]
    )
    res.status(201).json(r.rows[0])
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ message: 'ID san pham da ton tai' })
    console.error(e)
    res.status(500).json({ message: 'Loi server' })
  }
})

// PUT /api/products/:id (admin)
router.put('/:id', authRequired, adminOnly, async (req, res) => {
  try {
    const f = req.body || {}
    if (f.price != null && f.price < 0) return res.status(400).json({ message: 'Gia khong hop le' })
    const r = await query(
      `UPDATE products SET name=COALESCE($1,name), price=COALESCE($2,price), old_price=$3,
       category=COALESCE($4,category), badge=$5, image=COALESCE($6,image),
       description=COALESCE($7,description), stock=COALESCE($8,stock), updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [f.name || null, f.price ?? null, f.old_price ?? null, f.category || null, f.badge ?? null, f.image || null, f.description || null, f.stock ?? null, req.params.id]
    )
    if (!r.rows[0]) return res.status(404).json({ message: 'Khong tim thay' })
    res.json(r.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Loi server' })
  }
})

// DELETE /api/products/:id (admin)
router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  try {
    await query('DELETE FROM products WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Loi server' })
  }
})

export default router
