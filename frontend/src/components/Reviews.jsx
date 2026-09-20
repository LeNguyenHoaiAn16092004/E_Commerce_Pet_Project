import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useShop } from '../store/ShopContext.jsx'
import { useLocale } from '../i18n/LocaleContext.jsx'
import { api } from '../lib/api.js'

export default function Reviews({ productId }) {
  const { user, earnPoints } = useShop()
  const { t, lang } = useLocale()
  const [data, setData] = useState(null)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try { setData(await api.getReviews(productId)) }
    catch { setData(null) }
  }
  useEffect(() => { load() }, [productId])

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setMsg(null)
    try {
      await api.addReview(productId, { rating, title, comment })
      setTitle(''); setComment(''); setRating(5)
      await load()
      earnPoints(50)
    } catch (err) {
      setMsg(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('OK?')) return
    try { await api.deleteReview(id); await load() } catch (err) { setMsg(err.message) }
  }

  const s = data?.summary
  const avg = Number(s?.avg || 0)
  const count = Number(s?.count || 0)

  return (
    <div className="mt-12 bg-white border-2 border-pop-dark rounded-[2rem] p-6 md:p-8 shadow-pop-sm">
      <h2 className="font-display font-bold text-3xl">{t('rev.title')} ({count})</h2>
      {data ? (
        <div className="grid md:grid-cols-[220px_1fr] gap-6 mt-4">
          <div className="text-center bg-orange-50 border-2 border-dashed border-pop-dark/20 rounded-2xl p-4 h-fit">
            <div className="font-display font-bold text-5xl">{avg ? avg.toFixed(1) : '–'}</div>
            <div className="text-amber-500 font-bold">{'★'.repeat(Math.round(avg)) || '☆☆☆☆☆'}</div>
            <div className="mt-2 space-y-1 text-left">
              {[5, 4, 3, 2, 1].map((n) => {
                const c = Number(s?.[`s${n}`] || 0)
                const pct = count ? Math.round((c / count) * 100) : 0
                return (
                  <div key={n} className="flex items-center gap-2 text-xs font-bold">
                    <span className="w-6">{n}★</span>
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-amber-400" style={{ width: pct + '%' }} /></div>
                    <span className="w-8 text-right">{c}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            {user ? (
              <form onSubmit={submit} className="grid gap-2 bg-yellow-50/50 border-2 border-dashed border-pop-dark/20 rounded-2xl p-4">
                <div className="font-bold text-sm">{t('rev.write')} <span className="text-green-600">(+50)</span></div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? 'text-amber-400' : 'text-gray-300'}`}>★</button>
                  ))}
                </div>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('rev.titlePh')} maxLength={100} className="border-2 border-pop-dark rounded-2xl px-4 py-2 outline-none" />
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('rev.commentPh')} maxLength={1000} rows={3} className="border-2 border-pop-dark rounded-2xl px-4 py-2 outline-none" />
                {msg && <p className="text-sm font-bold text-red-500">{msg}</p>}
                <button disabled={busy} className="justify-self-start bg-pop-dark text-white rounded-full px-6 py-2.5 font-bold disabled:opacity-50">{busy ? '…' : t('rev.send')}</button>
              </form>
            ) : (
              <p className="font-bold text-sm bg-gray-50 border-2 border-dashed rounded-2xl p-4">{t('rev.login')} → <Link to="/login" className="text-pop-pink underline">{t('nav.login')}</Link></p>
            )}
            <div className="space-y-3 mt-4">
              {(data.reviews || []).map((r) => (
                <div key={r.id} className="border-b border-dashed border-gray-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 grid place-items-center rounded-full bg-pop-purple text-white font-bold text-sm">{(r.user_name || '?')[0].toUpperCase()}</span>
                    <span className="font-bold text-sm">{r.user_name}</span>
                    <span className="text-amber-500 font-bold text-sm">{'★'.repeat(r.rating)}</span>
                    <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}</span>
                    {(user && (user.id === r.user_id || user.role === 'admin')) && (
                      <button onClick={() => remove(r.id)} className="ml-auto text-xs font-bold text-red-500 underline">{t('common.delete')}</button>
                    )}
                  </div>
                  {r.title && <div className="font-bold text-sm mt-1">{r.title}</div>}
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                </div>
              ))}
              {count === 0 && <p className="font-bold text-gray-400 text-sm py-2">{t('rev.empty')}</p>}
            </div>
          </div>
        </div>
      ) : (
        <p className="font-bold text-gray-400 mt-2 text-sm">{t('rev.empty')}</p>
      )}
    </div>
  )
}
