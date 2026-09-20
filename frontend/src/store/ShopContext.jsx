import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { PRODUCTS, normalizeProduct, normalizeOrder } from '../data/products.js'
import { api, saveToken } from '../lib/api.js'
const ShopContext = createContext(null)
const load = (k, fb) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb } catch { return fb }
}

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => load('shopfun-cart', []))
  const [wishlist, setWishlist] = useState(() => load('shopfun-wishlist', []))
  const [user, setUser] = useState(() => load('shopfun-user', null))
  const [localOrders, setLocalOrders] = useState(() => load('shopfun-orders', []))
  const [apiOrders, setApiOrders] = useState([])
  const [products, setProducts] = useState(PRODUCTS)
  const [productsLoading, setProductsLoading] = useState(true)
  const [apiOnline, setApiOnline] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [voucher, setVoucher] = useState(null) // { code, type, value, min_order, discount }
  const [points, setPoints] = useState(() => load('shopfun-points', 0))
  const [lastCheckin, setLastCheckin] = useState(() => load('shopfun-checkin', null))
  const [appConfig, setAppConfig] = useState({ vietqr: {}, usdToVnd: 25000 })

  useEffect(() => localStorage.setItem('shopfun-cart', JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem('shopfun-wishlist', JSON.stringify(wishlist)), [wishlist])
  useEffect(() => localStorage.setItem('shopfun-user', JSON.stringify(user)), [user])
  useEffect(() => localStorage.setItem('shopfun-orders', JSON.stringify(localOrders)), [localOrders])
  useEffect(() => localStorage.setItem('shopfun-points', JSON.stringify(points)), [points])
  useEffect(() => localStorage.setItem('shopfun-checkin', JSON.stringify(lastCheckin)), [lastCheckin])

  const say = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200) }

  // ---- Products: API that, fallback mock ----
  const refreshProducts = async () => {
    try {
      const rows = await api.products()
      if (Array.isArray(rows) && rows.length) {
        setProducts(rows.map(normalizeProduct))
        setApiOnline(true)
      }
    } catch {
      setApiOnline(false) // giu mock cu
    } finally {
      setProductsLoading(false)
    }
  }

  // ---- Orders tu API (neu dang nhap cookie session) ----
  const refreshOrders = async () => {
    try {
      const rows = await api.myOrders()
      setApiOrders(rows.map(normalizeOrder))
      setApiOnline(true)
    } catch {
      if (user) setApiOrders([])
    }
  }

  useEffect(() => {
    saveToken() // xoa token localStorage cu (da chuyen sang httpOnly cookie)
    refreshProducts()
    api.appConfig().then(setAppConfig).catch(() => {})
    // khoi phuc session tu httpOnly cookie
    api.me().then((u) => { if (u) { setUser(u); setApiOnline(true); } refreshOrders() }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Cart ----
  const addToCart = (id, qty = 1) => {
    setCart((c) => {
      const f = c.find((i) => i.id === id)
      if (f) return c.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i))
      return [...c, { id, qty }]
    })
    say('Added to cart!')
  }
  const removeFromCart = (id) => setCart((c) => c.filter((i) => i.id !== id))
  const setQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id)
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty } : i)))
  }
  const clearCart = () => setCart([])

  const toggleWishlist = (id) => {
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]))
  }

  // ---- Auth: API that, fallback demo ----
  // Loi 4xx (sai pass, trung email, rate-limit...) -> tra null + hien loi, KHONG tao demo user.
  // Chi khi backend khong ket noi duoc (network/5xx) moi dung demo de app van xem duoc.
  const login = async (email, password) => {
    setAuthLoading(true); setAuthError(null)
    try {
      const { user: u } = await api.login({ email, password })
      setUser(u); setApiOnline(true); say('Welcome back!')
      refreshOrders()
      return u
    } catch (e) {
      if (e.status && e.status < 500) {
        setAuthError(e.message)
        return null
      }
      const demo = { name: email.split('@')[0], email, role: 'customer', demo: true }
      setUser(demo)
      say('Backend offline – dung che do demo')
      return demo
    } finally {
      setAuthLoading(false)
    }
  }
  const register = async (name, email, password) => {
    setAuthLoading(true); setAuthError(null)
    try {
      const { user: u } = await api.register({ name, email, password })
      setUser(u); setApiOnline(true); say('Account created!')
      return u
    } catch (e) {
      if (e.status && e.status < 500) {
        setAuthError(e.message)
        return null
      }
      const demo = { name, email, role: 'customer', demo: true }
      setUser(demo)
      say('Backend offline – dung che do demo')
      return demo
    } finally {
      setAuthLoading(false)
    }
  }
  const logout = async () => {
    try { await api.logout() } catch { /* backend offline */ }
    saveToken(); setUser(null); setApiOrders([]); setVoucher(null); say('Logged out')
  }

  const refreshMe = async () => {
    try {
      const u = await api.me()
      if (u) { setUser(u); setApiOnline(true) }
      return u
    } catch { return null }
  }

  // ---- Voucher: API that, fallback local ----
  const calcLocalDiscount = (v, subtotal) => {
    if (!v) return 0
    const d = v.type === 'percent' ? (subtotal * Number(v.value)) / 100 : Number(v.value)
    return Math.min(Math.round(d * 100) / 100, subtotal)
  }
  const applyVoucher = async (code, subtotal) => {
    const c = String(code || '').trim().toUpperCase()
    if (!c) throw new Error('Nhap ma giam gia')
    try {
      const r = await api.validateVoucher({ code: c, subtotal })
      const v = { code: r.code, type: r.type, value: Number(r.value), min_order: Number(r.min_order), discount: Number(r.discount) }
      setVoucher(v); setApiOnline(true)
      say('Ap dung voucher ' + v.code)
      return v
    } catch (e) {
      // fallback demo: 3 ma mau
      const demo = {
        WELCOME10: { type: 'percent', value: 10, min_order: 0 },
        SALE20: { type: 'percent', value: 20, min_order: 100 },
        SAVE5: { type: 'fixed', value: 5, min_order: 30 },
      }[c]
      if (!demo) throw e
      if (subtotal < demo.min_order) throw new Error(`Don toi thieu $${demo.min_order}`)
      const v = { code: c, ...demo, discount: calcLocalDiscount({ code: c, ...demo }, subtotal) }
      setVoucher(v)
      say('Ap dung voucher ' + c + ' (demo)')
      return v
    }
  }
  const clearVoucher = () => setVoucher(null)

  // ---- Gamification: diem, diem danh ----
  const earnPoints = (n) => {
    if (n > 0) { setPoints((p) => p + Math.floor(n)); say(`+${Math.floor(n)} diem!`) }
  }
  const checkin = () => {
    const today = new Date().toISOString().slice(0, 10)
    if (lastCheckin === today) return false
    setLastCheckin(today)
    try { localStorage.setItem('shopfun-checkin', JSON.stringify(today)) } catch { /* ignore */ }
    earnPoints(20)
    return true
  }

  // ---- Combo dong: >=3 mon apparel -> giam 15% tien hang apparel (giong server) ----

  // ---- Checkout: API that, fallback local ----
  const checkout = async (info) => {
    const subtotal = cart.reduce((s, c) => s + priceOf(c.id) * c.qty, 0)
    const discount = calcLocalDiscount(voucher, subtotal)
    const bundle = calcBundle()
    const earn = Math.floor(subtotal - discount - bundle)
    if (user) {
      try {
        const o = await api.createOrder({
          items: cart.map((c) => ({ product_id: c.id, qty: c.qty })),
          address: info.address, city: info.city, zip: info.zip,
          voucherCode: voucher?.code || undefined,
          payment_method: info.payment_method || 'cod',
        })
        const full = await api.myOrders().then((r) => r.map(normalizeOrder)).catch(() => [])
        if (full.length) setApiOrders(full)
        clearCart(); clearVoucher(); earnPoints(earn)
        return normalizeOrder({ ...o, items: cart.map((c) => ({ ...c, ...products.find((p) => p.id === c.id) })), email: info.email })
      } catch (e) {
        say('Dat hang online loi: ' + e.message + ' – luu don local')
      }
    }
    const items = cart.map((c) => ({ ...c, ...products.find((p) => p.id === c.id) }))
    const total = Math.round((subtotal - discount - bundle) * 100) / 100
    const order = { id: 'ORD-' + Math.floor(100000 + Math.random() * 900000), date: new Date().toISOString(), items, total, discount, bundle_discount: bundle, voucher_code: voucher?.code || null, payment_method: info.payment_method || 'cod', payment_status: 'pending', ...info, status: 'Processing' }
    setLocalOrders((o) => [order, ...o])
    clearCart(); clearVoucher(); earnPoints(earn)
    return order
  }

  const orders = apiOrders.length ? apiOrders : localOrders
  const priceOf = (id) => Number(products.find((p) => p.id === id)?.price || 0)
  const cartSubtotal = cart.reduce((s, i) => s + priceOf(i.id) * i.qty, 0)
  const voucherDiscount = calcLocalDiscount(voucher, cartSubtotal)
  // Combo: cung cong thuc voi server
  const calcBundle = () => {
    let q = 0, s = 0
    for (const c of cart) {
      if (products.find((p) => p.id === c.id)?.category === 'apparel') { q += c.qty; s += priceOf(c.id) * c.qty }
    }
    return q >= 3 ? Math.round(s * 0.15 * 100) / 100 : 0
  }
  const bundleDiscount = calcBundle()

  const value = useMemo(() => ({
    cart, wishlist, user, orders, cartOpen, toast,
    products, productsLoading, apiOnline, authLoading, authError,
    voucher, voucherDiscount, bundleDiscount,
    points, lastCheckin, appConfig,
    setCartOpen, addToCart, removeFromCart, setQty, clearCart,
    toggleWishlist, login, register, logout, checkout, refreshMe,
    applyVoucher, clearVoucher, earnPoints, checkin,
    refreshProducts, refreshOrders,
    cartCount: cart.reduce((s, i) => s + i.qty, 0),
    cartTotal: cartSubtotal,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [cart, wishlist, user, orders, cartOpen, toast, products, productsLoading, apiOnline, authLoading, authError, voucher, cartSubtotal, bundleDiscount, points, lastCheckin, appConfig])

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export const useShop = () => useContext(ShopContext)

// Hang thanh vien theo diem tich luy
export const RANKS = [
  { min: 0, vi: 'Thành viên mới', en: 'Newbie', color: 'bg-gray-200 text-gray-700' },
  { min: 300, vi: 'Hạng Đồng', en: 'Bronze', color: 'bg-orange-200 text-orange-800' },
  { min: 1000, vi: 'Hạng Bạc', en: 'Silver', color: 'bg-slate-200 text-slate-700' },
  { min: 3000, vi: 'Hạng Vàng', en: 'Gold', color: 'bg-pop-yellow text-pop-dark' },
  { min: 8000, vi: 'Kim cương', en: 'Diamond', color: 'bg-cyan-200 text-cyan-800' },
]
export const rankOf = (points) => {
  let cur = RANKS[0], next = null
  for (let i = 0; i < RANKS.length; i++) {
    if (points >= RANKS[i].min) { cur = RANKS[i]; next = RANKS[i + 1] || null }
  }
  return { cur, next }
}
