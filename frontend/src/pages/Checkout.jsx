import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useShop } from '../store/ShopContext.jsx'
import { useLocale } from '../i18n/LocaleContext.jsx'
import SEO from '../components/SEO.jsx'

export default function Checkout() {
  const { cart, cartTotal, voucherDiscount, bundleDiscount, voucher, checkout, user, apiOnline, appConfig } = useShop()
  const { t, formatPrice } = useLocale()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', address: '', city: '', zip: '', payment_method: 'cod' })
  const [done, setDone] = useState(null)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState(null)
  const net = cartTotal - voucherDiscount - bundleDiscount
  const shipping = net >= 50 ? 0 : 4.99
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const vndTotal = Math.round((net + shipping) * (appConfig.usdToVnd || 25000))
  const vqr = appConfig.vietqr || {}
  const qrUrl = vqr.bank && vqr.account
    ? `https://img.vietqr.io/image/${vqr.bank}-${vqr.account}-compact2.png?amount=${vndTotal}&addInfo=SHOPFUN&accountName=${encodeURIComponent(vqr.name || 'SHOPFUN')}`
    : null

  const pay = async () => {
    setPaying(true); setPayError(null)
    try {
      const order = await checkout(form)
      setDone({ ...order, total: Number(order.total), email: form.email })
    } catch (e) {
      setPayError(e.message)
    } finally {
      setPaying(false)
    }
  }

  if (!user) return (
    <div className="max-w-md mx-auto px-4 pt-12 text-center">
      <div className="bg-white border-2 border-pop-dark rounded-[2rem] p-8 shadow-pop">
        <h1 className="font-display font-bold text-3xl">{t('co.needLoginT')}</h1>
        <p className="font-bold text-gray-500 text-sm mt-2">{t('co.needLoginS')}</p>
        <Link to="/login" state={{ from: '/checkout' }} className="inline-block mt-5 bg-pop-pink text-white border-2 border-pop-dark rounded-full px-8 py-3 font-bold shadow-pop-sm">{t('co.loginBtn')}</Link>
        <p className="text-sm font-bold mt-3">{t('co.noAcc')} <Link to="/register" state={{ from: '/checkout' }} className="text-pop-pink underline">{t('co.register')}</Link></p>
      </div>
    </div>
  )
  if (cart.length === 0 && !done) return <div className="max-w-xl mx-auto p-10 text-center font-bold">Nothing to checkout. <Link to="/shop" className="underline">Shop first</Link></div>
  if (done) {
    const dTotal = Number(done.total)
    return (
      <div className="max-w-xl mx-auto px-4 pt-12 text-center">
        <div className="bg-white border-2 border-pop-dark rounded-[2rem] p-10 shadow-pop">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-400 border-2 border-pop-dark grid place-items-center text-4xl font-bold">✓</div>
          <h1 className="font-display font-bold text-4xl mt-4">{t('co.done')}</h1>
          <p className="font-bold text-gray-500 mt-2">Order {done.id} • {formatPrice(dTotal + (dTotal >= 50 ? 0 : 4.99))} • {t('co.receipt')} {done.email}</p>
          {!apiOnline && <p className="text-xs font-bold text-amber-600 mt-1">{t('co.localNote')}</p>}
          <div className="flex gap-2 justify-center mt-6">
            <Link to="/account" className="bg-pop-dark text-white rounded-full px-6 py-3 font-bold">{t('co.track')}</Link>
            <Link to="/shop" className="bg-pop-yellow border-2 border-pop-dark rounded-full px-6 py-3 font-bold shadow-pop-sm">{t('co.keep')}</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-8">
      <SEO title={t('co.title')} noIndex />
      <div className="flex items-center gap-3">
        <h1 className="font-display font-bold text-4xl">{t('co.title')}</h1>
        {!apiOnline && <span className="text-xs font-extrabold rounded-full px-3 py-1 border-2 border-pop-dark bg-pop-yellow">{t('common.demo')}</span>}
      </div>
      <div className="flex gap-2 mt-4">{[1, 2, 3].map((s) => <div key={s} className={`flex-1 h-3 rounded-full border-2 border-pop-dark ${step >= s ? 'bg-pop-pink' : 'bg-white'}`} />)}</div>
      <div className="grid md:grid-cols-[1fr_300px] gap-6 mt-6">
        <div className="bg-white border-2 border-pop-dark rounded-3xl p-6 shadow-pop-sm">
          {step === 1 && (
            <div>
              <h2 className="font-display font-bold text-2xl">{t('co.s1')}</h2>
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <input value={form.name} onChange={set('name')} placeholder={t('co.name')} className="border-2 border-pop-dark rounded-2xl px-4 py-2.5 outline-none focus:bg-yellow-50" />
                <input value={form.email} onChange={set('email')} placeholder={t('co.email')} className="border-2 border-pop-dark rounded-2xl px-4 py-2.5 outline-none focus:bg-yellow-50" />
                <input value={form.address} onChange={set('address')} placeholder={t('co.address')} className="sm:col-span-2 border-2 border-pop-dark rounded-2xl px-4 py-2.5 outline-none focus:bg-yellow-50" />
                <input value={form.city} onChange={set('city')} placeholder={t('co.city')} className="border-2 border-pop-dark rounded-2xl px-4 py-2.5 outline-none focus:bg-yellow-50" />
                <input value={form.zip} onChange={set('zip')} placeholder={t('co.zip')} className="border-2 border-pop-dark rounded-2xl px-4 py-2.5 outline-none focus:bg-yellow-50" />
              </div>
              <button onClick={() => setStep(2)} disabled={!form.name || !form.email || !form.address} className="mt-4 w-full bg-pop-dark text-white rounded-full py-3 font-bold disabled:opacity-40">{t('co.continue')}</button>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="font-display font-bold text-2xl">{t('co.s2')}</h2>
              <div className="grid gap-3 mt-4">
                <button onClick={() => setForm({ ...form, payment_method: 'cod' })} className={`text-left border-2 rounded-2xl p-4 ${form.payment_method === 'cod' ? 'border-pop-pink bg-pink-50' : 'border-pop-dark/20'}`}>
                  <div className="font-bold">{form.payment_method === 'cod' ? '◉' : '○'} {t('pay.cod')}</div>
                  <div className="text-sm font-semibold text-gray-500">{t('pay.codSub')}</div>
                </button>
                <button onClick={() => setForm({ ...form, payment_method: 'vietqr' })} className={`text-left border-2 rounded-2xl p-4 ${form.payment_method === 'vietqr' ? 'border-pop-pink bg-pink-50' : 'border-pop-dark/20'}`}>
                  <div className="font-bold">{form.payment_method === 'vietqr' ? '◉' : '○'} {t('pay.vietqr')}</div>
                  <div className="text-sm font-semibold text-gray-500">{t('pay.vietqrSub')}</div>
                </button>
                {form.payment_method === 'vietqr' && (
                  qrUrl ? (
                    <div className="text-center border-2 border-dashed border-pop-dark/20 rounded-2xl p-4">
                      <img src={qrUrl} alt="VietQR" className="w-56 h-56 mx-auto rounded-xl border-2 border-pop-dark/10" />
                      <div className="font-bold text-sm mt-2">{t('pay.scan')}</div>
                      <div className="text-sm font-semibold text-gray-600">{vqr.bank} • {vqr.account} • {vqr.name}</div>
                      <div className="font-display font-bold text-xl mt-1">{t('pay.amount')}: {vndTotal.toLocaleString()} đ</div>
                      <div className="text-xs font-bold text-gray-500">{t('pay.content')}: SHOPFUN</div>
                      <div className="text-xs font-bold text-amber-600 mt-1">{t('pay.note')}</div>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-amber-600">{t('pay.unset')}</p>
                  )
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setStep(1)} className="flex-1 border-2 border-pop-dark rounded-full py-3 font-bold">{t('co.back')}</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-pop-dark text-white rounded-full py-3 font-bold disabled:opacity-40">{t('co.review')}</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="font-display font-bold text-2xl">{t('co.s3')} {formatPrice(net + shipping)}</h2>
              <p className="text-sm font-bold text-gray-500 mt-2">{t('co.shipTo')} {form.name}, {form.address}, {form.city} {form.zip}</p>
              <p className="text-sm font-bold text-gray-500">{t('pay.method')}: {form.payment_method === 'vietqr' ? t('pay.vietqr') : t('pay.cod')}</p>
              {voucher && <p className="text-sm font-bold text-green-600 mt-1">✓ {voucher.code} (−{formatPrice(voucherDiscount)})</p>}
              {bundleDiscount > 0 && <p className="text-sm font-bold text-green-600">✓ {t('bundle.name')} (−{formatPrice(bundleDiscount)})</p>}
              {payError && <p className="text-sm font-bold text-red-500 mt-2">{payError}</p>}
              <div className="flex gap-2 mt-4">
                <button onClick={() => setStep(2)} className="flex-1 border-2 border-pop-dark rounded-full py-3 font-bold">{t('co.back')}</button>
                <button onClick={pay} disabled={paying} className="flex-1 bg-pop-pink text-white border-2 border-pop-dark rounded-full py-3 font-bold shadow-pop-sm disabled:opacity-50">{paying ? t('co.paying') : t('co.pay')}</button>
              </div>
            </div>
          )}
        </div>
        <div className="bg-pop-dark text-white rounded-3xl p-6 h-fit">
          <div className="font-display font-bold text-xl">{t('cart.total')}: {formatPrice(net + shipping)}</div>
          <div className="text-sm font-bold text-white/60 mt-1">{cart.reduce((s, i) => s + i.qty, 0)} {t('co.items')} • shipping {shipping === 0 ? t('cart.free') : formatPrice(shipping)}</div>
          {voucherDiscount > 0 && <div className="text-sm font-bold text-green-300 mt-1">{t('voucher.discount')}: −{formatPrice(voucherDiscount)}</div>}
          {bundleDiscount > 0 && <div className="text-sm font-bold text-green-300">{t('bundle.name')}: −{formatPrice(bundleDiscount)}</div>}
        </div>
      </div>
    </div>
  )
}
