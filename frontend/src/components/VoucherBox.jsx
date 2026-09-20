import { useState } from 'react'
import { useShop } from '../store/ShopContext.jsx'
import { useLocale } from '../i18n/LocaleContext.jsx'

export default function VoucherBox() {
  const { voucher, voucherDiscount, applyVoucher, clearVoucher, cartTotal } = useShop()
  const { t, formatPrice } = useLocale()
  const [code, setCode] = useState('')
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)

  const apply = async (e) => {
    e.preventDefault(); setErr(null); setBusy(true)
    try {
      await applyVoucher(code, cartTotal)
      setCode('')
    } catch (ex) {
      setErr(ex.message || t('voucher.err'))
    } finally {
      setBusy(false)
    }
  }

  if (voucher) {
    return (
      <div className="flex items-center gap-2 bg-green-50 border-2 border-dashed border-green-500 rounded-2xl px-4 py-2.5">
        <span className="font-extrabold text-green-700 text-sm">✓ {voucher.code} (−{formatPrice(voucherDiscount)})</span>
        <button onClick={clearVoucher} className="ml-auto text-xs font-bold text-red-500 underline">{t('voucher.remove')}</button>
      </div>
    )
  }
  return (
    <form onSubmit={apply}>
      <div className="flex gap-2">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('voucher.ph')} className="w-full border-2 border-pop-dark rounded-2xl px-4 py-2 outline-none uppercase placeholder:normal-case" />
        <button disabled={busy} className="shrink-0 bg-pop-teal text-white border-2 border-pop-dark rounded-2xl px-4 font-bold disabled:opacity-50">{busy ? '…' : t('voucher.apply')}</button>
      </div>
      {err && <p className="text-xs font-bold text-red-500 mt-1">{err}</p>}
    </form>
  )
}
