import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/products.js'
import { useShop } from '../store/ShopContext.jsx'
import { useLocale } from '../i18n/LocaleContext.jsx'
import { api } from '../lib/api.js'
import SEO from '../components/SEO.jsx'

const emptyForm = { name: '', price: '', category: 'apparel', image: '', description: '', badge: '', stock: '100' }
const emptyVoucher = { code: '', type: 'percent', value: '10', min_order: '0', max_uses: '100' }

export default function Admin() {
  const { orders, products, productsLoading, apiOnline, refreshProducts, user } = useShop()
  const { t, formatPrice } = useLocale()
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [msg, setMsg] = useState(null)
  const [saving, setSaving] = useState(false)
  const [vouchers, setVouchers] = useState([])
  const [vform, setVform] = useState(emptyVoucher)
  const [vmsg, setVmsg] = useState(null)
  const revenue = orders.reduce((s, o) => s + Number(o.total || 0), 0)
  const isAdmin = user?.role === 'admin'
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const setV = (k) => (e) => setVform({ ...vform, [k]: e.target.value })

  const loadVouchers = async () => {
    try { setVouchers(await api.listVouchers()) } catch { setVouchers([]) }
  }
  useEffect(() => { if (isAdmin) loadVouchers() }, [isAdmin])

  const startEdit = (p) => {
    setEditingId(p.id)
    setForm({
      name: p.name, price: String(p.price), category: p.category,
      image: p.image || '', description: p.description || '',
      badge: p.badge || '', stock: String(p.stock ?? 100),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setMsg(null)
    const body = {
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category,
      image: form.image.trim() || null,
      description: form.description.trim() || null,
      badge: form.badge.trim() || null,
      stock: Number(form.stock) || 0,
    }
    try {
      if (editingId) {
        await api.updateProduct(editingId, body)
        setMsg({ ok: true, text: `OK ${editingId}` })
      } else {
        body.id = 'p' + Date.now().toString(36)
        await api.createProduct(body)
        setMsg({ ok: true, text: 'OK' })
      }
      setForm(emptyForm); setEditingId(null)
      await refreshProducts()
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm(`${t('admin.confirmDel')} ${id}?`)) return
    setMsg(null)
    try {
      await api.deleteProduct(id)
      await refreshProducts()
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    }
  }

  const addVoucher = async (e) => {
    e.preventDefault(); setVmsg(null)
    try {
      await api.createVoucher({
        code: vform.code, type: vform.type, value: Number(vform.value),
        min_order: Number(vform.min_order) || 0, max_uses: Number(vform.max_uses) || 100,
      })
      setVform(emptyVoucher)
      await loadVouchers()
    } catch (err) {
      setVmsg(err.message)
    }
  }

  const delVoucher = async (code) => {
    if (!window.confirm(`${t('common.delete')} ${code}?`)) return
    try { await api.deleteVoucher(code); await loadVouchers() }
    catch (err) { setVmsg(err.message) }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-8">
      <SEO title={t('admin.title')} noIndex />
      <div className="flex items-center gap-3">
        <h1 className="font-display font-bold text-4xl">{t('admin.title')}</h1>
        <span className={`text-xs font-extrabold rounded-full px-3 py-1 border-2 border-pop-dark ${apiOnline ? 'bg-green-400' : 'bg-pop-yellow'}`}>{apiOnline ? t('common.apiLive') : t('common.demo')}</span>
        <button onClick={() => { refreshProducts(); loadVouchers() }} className="ml-auto text-sm font-bold underline">{t('common.reload')}</button>
      </div>

      {!user && <div className="mt-4 bg-white border-2 border-pop-dark rounded-2xl p-4 font-bold text-sm">{t('admin.needLogin')} <Link to="/login" className="text-pop-pink underline">{t('nav.login')}</Link></div>}
      {user && !isAdmin && <div className="mt-4 bg-pop-yellow border-2 border-pop-dark rounded-2xl p-4 font-bold text-sm"><b>{user.email}</b> {t('admin.needAdmin')}</div>}

      <div className="grid sm:grid-cols-4 gap-3 mt-6">
        {[[t('admin.revenue'), formatPrice(revenue)], [t('admin.orders'), orders.length], [t('admin.products'), products.length], [t('admin.rating'), '4.7 ★']].map(([k, v]) => (
          <div key={k} className="bg-white border-2 border-pop-dark rounded-3xl p-5 shadow-pop-sm"><div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">{k}</div><div className="font-display font-bold text-3xl">{v}</div></div>
        ))}
      </div>

      {/* Form them / sua san pham */}
      <h2 className="font-display font-bold text-2xl mt-8 mb-3">{editingId ? `${t('admin.editT')} ${editingId}` : t('admin.addT')}</h2>
      <form onSubmit={submit} className="bg-white border-2 border-pop-dark rounded-3xl p-5 shadow-pop-sm grid sm:grid-cols-2 gap-3">
        <input value={form.name} onChange={set('name')} placeholder={t('admin.name')} required className="border-2 border-pop-dark rounded-2xl px-4 py-2.5 outline-none focus:bg-yellow-50" />
        <div className="grid grid-cols-2 gap-3">
          <input value={form.price} onChange={set('price')} placeholder={t('admin.price')} type="number" step="0.01" min="0" required className="border-2 border-pop-dark rounded-2xl px-4 py-2.5 outline-none" />
          <input value={form.stock} onChange={set('stock')} placeholder={t('admin.stock')} type="number" min="0" className="border-2 border-pop-dark rounded-2xl px-4 py-2.5 outline-none" />
        </div>
        <select value={form.category} onChange={set('category')} className="border-2 border-pop-dark rounded-2xl px-4 py-2.5 font-bold bg-white">
          {CATEGORIES.filter((c) => c.id !== 'all').map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input value={form.badge} onChange={set('badge')} placeholder={t('admin.badge')} className="border-2 border-pop-dark rounded-2xl px-4 py-2.5 outline-none" />
        <input value={form.image} onChange={set('image')} placeholder={t('admin.image')} className="sm:col-span-2 border-2 border-pop-dark rounded-2xl px-4 py-2.5 outline-none" />
        <textarea value={form.description} onChange={set('description')} placeholder={t('admin.desc')} rows={2} className="sm:col-span-2 border-2 border-pop-dark rounded-2xl px-4 py-2.5 outline-none" />
        <div className="sm:col-span-2 flex gap-2">
          <button disabled={saving} className="flex-1 bg-pop-dark text-white rounded-full py-3 font-bold disabled:opacity-50">{saving ? t('admin.saving') : editingId ? t('admin.update') : t('admin.add')}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm) }} className="border-2 border-pop-dark rounded-full px-6 py-3 font-bold">{t('common.cancel')}</button>}
        </div>
        {msg && <p className={`sm:col-span-2 text-sm font-bold ${msg.ok ? 'text-green-600' : 'text-red-500'}`}>{msg.text}</p>}
      </form>

      <h2 className="font-display font-bold text-2xl mt-8 mb-3">{t('admin.catalog')} {productsLoading && `(${t('common.loading')})`}</h2>
      <div className="bg-white border-2 border-pop-dark rounded-3xl overflow-hidden shadow-pop-sm">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-3 border-b last:border-0 border-dashed border-gray-200">
            <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
            <div className="font-bold text-sm flex-1">{p.name}<div className="text-xs text-gray-400">{p.id} • {p.category} • ★ {p.rating} • stock {p.stock ?? '?'}</div></div>
            <div className="font-display font-bold">{formatPrice(p.price)}</div>
            <button onClick={() => startEdit(p)} className="text-xs font-extrabold rounded-full px-3 py-1.5 border-2 border-pop-dark bg-pop-yellow">{t('common.edit')}</button>
            <button onClick={() => remove(p.id)} className="text-xs font-extrabold rounded-full px-3 py-1.5 border-2 border-pop-dark bg-red-100 text-red-600">{t('common.delete')}</button>
          </div>
        ))}
      </div>

      {/* Quan ly voucher */}
      <h2 className="font-display font-bold text-2xl mt-8 mb-3">{t('admin.vTitle')}</h2>
      <form onSubmit={addVoucher} className="bg-white border-2 border-pop-dark rounded-3xl p-5 shadow-pop-sm grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <input value={vform.code} onChange={setV('code')} placeholder={t('admin.vCode')} required className="border-2 border-pop-dark rounded-2xl px-4 py-2.5 outline-none uppercase" />
        <select value={vform.type} onChange={setV('type')} className="border-2 border-pop-dark rounded-2xl px-4 py-2.5 font-bold bg-white">
          <option value="percent">{t('admin.vPercent')}</option>
          <option value="fixed">{t('admin.vFixed')}</option>
        </select>
        <input value={vform.value} onChange={setV('value')} placeholder="10" type="number" min="0.01" step="0.01" required className="border-2 border-pop-dark rounded-2xl px-4 py-2.5 outline-none" />
        <input value={vform.min_order} onChange={setV('min_order')} placeholder={t('admin.vMin')} type="number" min="0" className="border-2 border-pop-dark rounded-2xl px-4 py-2.5 outline-none" />
        <input value={vform.max_uses} onChange={setV('max_uses')} placeholder={t('admin.vMaxUses')} type="number" min="1" className="border-2 border-pop-dark rounded-2xl px-4 py-2.5 outline-none" />
        <button className="bg-pop-teal text-white border-2 border-pop-dark rounded-2xl py-2.5 font-bold">{t('admin.vAdd')}</button>
        {vmsg && <p className="sm:col-span-2 lg:col-span-6 text-sm font-bold text-red-500">{vmsg}</p>}
      </form>
      <div className="bg-white border-2 border-pop-dark rounded-3xl overflow-hidden shadow-pop-sm mt-3">
        {vouchers.length === 0 && <p className="p-4 font-bold text-gray-400 text-sm">WELCOME10 / SALE20 / SAVE5 {apiOnline ? '' : '(demo)'}</p>}
        {vouchers.map((v) => (
          <div key={v.code} className="flex items-center gap-3 p-3 border-b last:border-0 border-dashed border-gray-200">
            <span className="font-display font-bold bg-pop-yellow border-2 border-pop-dark rounded-full px-3 py-1 text-sm">{v.code}</span>
            <div className="font-bold text-sm flex-1">{v.type === 'percent' ? `${v.value}%` : `$${v.value}`} • min ${v.min_order} • {v.used_count}/{v.max_uses} {t('admin.vUses')}</div>
            <span className={`text-xs font-extrabold rounded-full px-3 py-1 ${v.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{v.active ? t('admin.vActive') : t('admin.vInactive')}</span>
            <button onClick={() => delVoucher(v.code)} className="text-xs font-extrabold rounded-full px-3 py-1.5 border-2 border-pop-dark bg-red-100 text-red-600">{t('common.delete')}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
