import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

if (!process.env.DATABASE_URL) {
  console.warn('[db] Chua co DATABASE_URL trong .env')
}

// DB remote (Neon/Render/Supabase...) bat buoc SSL; DB local (localhost) thi khong.
// rejectUnauthorized:false vi cac free tier dung cert khong verify duoc tu Node.
function sslFor(url) {
  try {
    const host = new URL(url).hostname
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return undefined
    return { rejectUnauthorized: false }
  } catch {
    return undefined
  }
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslFor(process.env.DATABASE_URL),
})

pool.on('error', (err) => console.error('[db] pool error', err))

export async function query(text, params) {
  return pool.query(text, params)
}
