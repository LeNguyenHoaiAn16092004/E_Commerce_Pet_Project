import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { query } from '../db.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Danh gia qua nhieu, doi 15 phut' },
})

async function refreshProductRating(productId) {
  const r = await query(
    'SELECT COUNT(*)::int AS n, COALESCE(AVG(rating),0) AS avg FROM reviews WHERE product_id=$1',
    [productId]
  )
  await query('UPDATE products SET rating=ROUND($1::numeric,1), reviews=$2 WHERE id=$3',
    [Number(r.rows[0].avg), r.rows[0].n, productId])
}

// Router mount tai /api — duong dan day du de tranh xung dot voi /api/products/:id
// GET /api/products/:id/reviews — tong hop + danh sach
router.get('/products/:id/reviews', async (req, res) => {
  try {
    const [list, agg] = await Promise.all([
      query(
        `SELECT r.id, r.rating, r.title, r.comment, r.created_at, u.name AS user_name, u.id AS user_id
         FROM reviews r JOIN users u ON u.id = r.user_id
         WHERE r.product_id=$1 ORDER BY r.created_at DESC LIMIT 50`,
        [req.params.id]
      ),
      query(
        `SELECT COUNT(*)::int AS count, COALESCE(AVG(rating),0) AS avg,
          COUNT(*) FILTER (WHERE rating=5)::int AS s5,
          COUNT(*) FILTER (WHERE rating=4)::int AS s4,
          COUNT(*) FILTER (WHERE rating=3)::int AS s3,
          COUNT(*) FILTER (WHERE rating=2)::int AS s2,
          COUNT(*) FILTER (WHERE rating=1)::int AS s1
         FROM reviews WHERE product_id=$1`,
        [req.params.id]
      ),
    ])
    res.json({ summary: agg.rows[0], reviews: list.rows })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Loi server' })
  }
})

// POST /api/products/:id/reviews (login, moi user 1 review/sp -> update)
router.post('/products/:id/reviews', authRequired, reviewLimiter, async (req, res) => {
  try {
    const { rating, title, comment } = req.body || {}
    const r5 = Number(rating)
    if (!Number.isInteger(r5) || r5 < 1 || r5 > 5) return res.status(400).json({ message: 'rating 1-5' })
    if (title && String(title).length > 100) return res.status(400).json({ message: 'Tieu de toi da 100 ky tu' })
    if (comment && String(comment).length > 1000) return res.status(400).json({ message: 'Nhan xet toi da 1000 ky tu' })
    const exists = await query('SELECT id FROM products WHERE id=$1', [req.params.id])
    if (!exists.rowCount) return res.status(404).json({ message: 'Khong tim thay san pham' })
    const r = await query(
      `INSERT INTO reviews(product_id,user_id,rating,title,comment)
       VALUES($1,$2,$3,$4,$5)
       ON CONFLICT (product_id,user_id) DO UPDATE SET rating=EXCLUDED.rating, title=EXCLUDED.title, comment=EXCLUDED.comment, updated_at=NOW()
       RETURNING *`,
      [req.params.id, req.user.id, r5, (title || '').slice(0, 100) || null, (comment || '').slice(0, 1000) || null]
    )
    await refreshProductRating(req.params.id)
    res.status(201).json(r.rows[0])
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Loi server' })
  }
})

// DELETE /api/reviews/:reviewId (chu review hoac admin)
router.delete('/reviews/:reviewId', authRequired, async (req, res) => {
  try {
    const r = await query('SELECT * FROM reviews WHERE id=$1', [req.params.reviewId])
    const rev = r.rows[0]
    if (!rev) return res.status(404).json({ message: 'Khong tim thay' })
    if (rev.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Khong co quyen xoa' })
    }
    await query('DELETE FROM reviews WHERE id=$1', [req.params.reviewId])
    await refreshProductRating(rev.product_id)
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Loi server' })
  }
})

export default router
