import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

if (!process.env.DATABASE_URL) {
  console.warn('[db] Chua co DATABASE_URL trong .env')
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

pool.on('error', (err) => console.error('[db] pool error', err))

export async function query(text, params) {
  return pool.query(text, params)
}
