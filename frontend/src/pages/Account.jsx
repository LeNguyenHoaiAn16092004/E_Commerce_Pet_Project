import { Link } from 'react-router-dom'
import { useShop, rankOf } from '../store/ShopContext.jsx'
import { useLocale } from '../i18n/LocaleContext.jsx'
import SEO from '../components/SEO.jsx'

export default function Account() {
  const { user, orders, logout, apiOnline, refreshOrders, points, lastCheckin, checkin } = useShop()
  const { t, lang, formatPrice } = useLocale()
  const { cur, next } = rankOf(points)
  const checkedToday = lastCheckin === new Date().toISOString().slice(0, 10)
  if (!user) return <div className="max-w-md mx-auto p-10 text-center"><div className="bg-white border-2 border-pop-dark rounded-3xl p-8 shadow-pop"><h1 className="font-display font-bold text-3xl">{t('acc.needLogin')}</h1><Link to="/login" className="inline-block mt-4 bg-pop-dark text-white rounded-full px-8 py-3 font-bold">{t('acc.goLogin')}</Link></div></div>
  return (
    <div className="max-w-5xl mx-auto px-4 pt-8">
      <SEO title={user.name} noIndex />
      <div className="bg-gradient-to-r from-pop-purple to-pop-pink text-white border-2 border-pop-dark rounded-3xl p-8 shadow-pop flex flex-wrap items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white text-pop-dark grid place-items-center font-display font-bold text-2xl border-2 border-pop-dark">{user.name[0].toUpperCase()}</div>
        <div><h1 className="font-display font-bold text-3xl">{t('acc.hey')} {user.name}!</h1><p className="font-bold text-white/70 text-sm">{user.email} • {user.role}</p></div>
        <span className={`text-xs font-extrabold rounded-full px-3 py-1 border-2 border-white ${apiOnline ? 'bg-green-400 text-pop-dark' : 'bg-pop-yellow text-pop-dark'}`}>{apiOnline ? t('common.apiLive') : t('common.demo')}</span>
        <div className="ml-auto flex gap-2">
          <Link to="/profile" className="bg-white text-pop-dark rounded-full px-6 py-2.5 font-bold border-2 border-pop-dark">{t('acc.editProfile')}</Link>
          <button onClick={logout} className="bg-pop-dark text-white rounded-full px-6 py-2.5 font-bold border-2 border-white">{t('nav.logout')}</button>
        </div>
      </div>
      <div className="mt-4 bg-white border-2 border-pop-dark rounded-3xl p-5 shadow-pop-sm flex flex-wrap items-center gap-4">
        <span className={`font-extrabold text-sm rounded-full px-4 py-1.5 border-2 border-pop-dark ${cur.color}`}>★ {lang === 'vi' ? cur.vi : cur.en}</span>
        <div className="font-display font-bold text-2xl">{points} pts</div>
        <div className="flex-1 min-w-[160px]">
          {next ? (
            <>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden border border-pop-dark/20">
                <div className="h-full bg-gradient-to-r from-pop-pink to-pop-orange" style={{ width: Math.min(100, Math.round(((points - cur.min) / (next.min - cur.min)) * 100)) + '%' }} />
              </div>
              <div className="text-xs font-bold text-gray-500 mt-1">{next.min - points} {t('pts.next')} {lang === 'vi' ? next.vi : next.en}</div>
            </>
          ) : (
            <div className="text-xs font-bold text-green-600">{t('pts.max')}</div>
          )}
        </div>
        <button onClick={checkin} disabled={checkedToday} className="bg-pop-yellow border-2 border-pop-dark rounded-full px-5 py-2 font-bold shadow-pop-sm disabled:opacity-40 text-sm">
          {checkedToday ? t('pts.checked') : t('pts.checkin')}
        </button>
        <Link to="/spin" className="bg-pop-purple text-white border-2 border-pop-dark rounded-full px-5 py-2 font-bold text-sm">Spin</Link>
      </div>
      <div className="flex items-center mt-8 mb-3">
        <h2 className="font-display font-bold text-2xl">{t('acc.history')} ({orders.length})</h2>
        <button onClick={refreshOrders} className="ml-auto text-sm font-bold underline">{t('common.reload')}</button>
      </div>
      {orders.length === 0 && <div className="bg-white border-2 border-pop-dark rounded-3xl p-8 text-center font-bold text-gray-500">{t('acc.noOrders')} <Link to="/shop" className="text-pop-pink underline">{t('acc.shopNow')}</Link></div>}
      <div className="space-y-3">
        {orders.map((o) => {
          const total = Number(o.total)
          const date = o.date || o.created_at
          const items = o.items || []
          const count = items.reduce((s, i) => s + Number(i.qty || 0), 0)
          return (
            <div key={o.id} className="bg-white border-2 border-pop-dark rounded-3xl p-5 shadow-pop-sm">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="font-display font-bold text-lg">{o.id}</span>
                <span className="bg-green-400 border border-pop-dark rounded-full px-3 py-0.5 text-xs font-extrabold">{o.status}</span>
                {o.voucher_code && <span className="bg-pop-yellow border border-pop-dark rounded-full px-3 py-0.5 text-xs font-extrabold">{o.voucher_code} (−{formatPrice(o.discount)})</span>}
                {Number(o.bundle_discount) > 0 && <span className="bg-green-100 border border-pop-dark rounded-full px-3 py-0.5 text-xs font-extrabold">combo −{formatPrice(o.bundle_discount)}</span>}
                {o.payment_method && <span className="bg-slate-100 border border-pop-dark rounded-full px-3 py-0.5 text-xs font-extrabold">{o.payment_method === 'vietqr' ? 'VietQR' : 'COD'} • {o.payment_status}</span>}
                <span className="ml-auto font-bold">{formatPrice(total)}</span>
              </div>
              <div className="text-xs font-bold text-gray-400">{date ? new Date(date).toLocaleString() : ''}{count ? ` • ${count} ${t('co.items')}` : ''}</div>
              {items.length > 0 && <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">{items.map((i) => <img key={i.id || i.product_id} src={i.image} alt={i.name} title={i.name} className="w-14 h-14 rounded-xl object-cover border-2 border-pop-dark/10" />)}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
