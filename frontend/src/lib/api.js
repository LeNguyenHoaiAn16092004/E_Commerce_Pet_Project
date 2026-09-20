const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// CSRF double-submit: lay token 1 lan, gui kem moi POST/PUT/DELETE qua header.
// Cookie httpOnly session + csrf tu dong gui nho credentials:'include'.
let csrfToken = null
async function ensureCsrf() {
  if (csrfToken) return csrfToken
  const res = await fetch(`${BASE}/api/csrf-token`, { credentials: 'include' })
  if (!res.ok) throw new Error('CSRF unavailable')
  const j = await res.json()
  csrfToken = j.csrfToken
  return csrfToken
}

async function req(path, opts = {}, retried = false) {
  const method = (opts.method || 'GET').toUpperCase()
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  // Tuong thich nguoc token cu trong localStorage (se xoa dan)
  const legacy = localStorage.getItem('shopfun-token')
  if (legacy) headers.Authorization = `Bearer ${legacy}`
  if (!['GET', 'HEAD'].includes(method)) {
    try {
      headers['x-csrf-token'] = await ensureCsrf()
    } catch { /* backend cu chua co csrf */ }
  }
  const res = await fetch(`${BASE}${path}`, { credentials: 'include', ...opts, method, headers })
  const body = await res.json().catch(() => ({}))
  if (res.status === 403 && body.code === 'EBADCSRFTOKEN' && !retried) {
    csrfToken = null // token het han -> lay moi va thu lai 1 lan
    return req(path, opts, true)
  }
  if (!res.ok) {
    const e = new Error(body.message || `API ${res.status}`)
    e.status = res.status
    throw e
  }
  return body
}

export const api = {
  health: () => req('/api/health'),
  products: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return req(`/api/products${q ? '?' + q : ''}`)
  },
  product: (id) => req(`/api/products/${id}`),
  createProduct: (body) => req('/api/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body) => req(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id) => req(`/api/products/${id}`, { method: 'DELETE' }),
  register: (body) => req('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => req('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => req('/api/auth/logout', { method: 'POST' }),
  me: () => req('/api/auth/me'),
  updateProfile: (body) => req('/api/auth/me', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body) => req('/api/auth/password', { method: 'PUT', body: JSON.stringify(body) }),
  createOrder: (body) => req('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
  myOrders: () => req('/api/orders'),
  validateVoucher: (body) => req('/api/vouchers/validate', { method: 'POST', body: JSON.stringify(body) }),
  listVouchers: () => req('/api/vouchers'),
  createVoucher: (body) => req('/api/vouchers', { method: 'POST', body: JSON.stringify(body) }),
  deleteVoucher: (code) => req(`/api/vouchers/${code}`, { method: 'DELETE' }),
  appConfig: () => req('/api/config'),
  getReviews: (productId) => req(`/api/products/${productId}/reviews`),
  addReview: (productId, body) => req(`/api/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(body) }),
  deleteReview: (reviewId) => req(`/api/reviews/${reviewId}`, { method: 'DELETE' }),
}

// Khong con luu token o localStorage (chuyen sang httpOnly cookie).
// Ham giu lai de xoa token cu neu con sot.
export function saveToken() {
  localStorage.removeItem('shopfun-token')
  csrfToken = null
}
