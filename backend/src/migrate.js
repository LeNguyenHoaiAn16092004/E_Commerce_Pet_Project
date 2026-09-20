import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { pool } from './db.js'

dotenv.config()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sql = fs.readFileSync(path.join(__dirname, '..', 'sql', 'schema.sql'), 'utf8')

const client = await pool.connect()
try {
  await client.query(sql)
  console.log('[migrate] OK - da tao bang + seed du lieu')
} catch (e) {
  console.error('[migrate] FAIL', e.message)
  process.exit(1)
} finally {
  client.release()
  await pool.end()
}
