import { Link } from 'react-router-dom'
import { useShop } from '../store/ShopContext.jsx'
import { useLocale } from '../i18n/LocaleContext.jsx'
import VoucherBox from '../components/VoucherBox.jsx'
import SEO from '../components/SEO.jsx'

export default function Cart() {
  const { cart, setQty, removeFromCart, cartTotal, voucherDiscount, bundleDiscount, voucher, products } = useShop()
  const { t, formatPrice } = useLocale()
  const net = cartTotal - voucherDiscount - bundleDiscount
  const shipping = net >= 50 || net === 0 ? 0 : 4.99
  const apparelQty = cart.reduce((s, i) => s + (products.find((p) => p.id === i.id)?.category === 'apparel' ? i.qty : 0), 0)
  return (
    <div className="max-w-5xl mx-auto px-4 pt-8">
      <SEO title={t('cart.title')} noIndex />
      <h1 className="font-display font-bold text-4xl">{t('cart.title')}</h1>
      {cart.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-pop-dark rounded-3xl shadow-pop mt-6">
          <div className="text-6xl">🛒</div>
          <p className="font-display font-bold text-2xl mt-4">{t('cart.emptyT')}</p>
          <Link to="/shop" className="inline-block mt-4 bg-pop-yellow border-2 border-pop-dark rounded-full px-8 py-3 font-bold shadow-pop-sm">{t('cart.emptyB')}</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr_320px] gap-6 mt-6">
          <div className="space-y-3">
            {cart.map((i) => {
              const p = products.find((x) => x.id === i.id)
              if (!p) return null
              return (
                <div key={i.id} className="flex gap-4 bg-white rounded-3xl border-2 border-pop-dark p-4 shadow-pop-sm">
                  <Link to={`/product/${p.id}`}><img src={p.image} alt={p.name} className="w-24 h-24 rounded-2xl object-cover border-2 border-pop-dark/10" /></Link>
                  <div className="flex-1">
                    <Link to={`/product/${p.id}`} className="font-bold hover:text-pop-pink">{p.name}</Link>
                    <div className="font-display font-bold text-lg">{formatPrice(p.price)}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => setQty(i.id, i.qty - 1)} className="w-8 h-8 rounded-full border-2 border-pop-dark font-bold">-</button>
                      <span className="font-bold">{i.qty}</span>
                      <button onClick={() => setQty(i.id, i.qty + 1)} className="w-8 h-8 rounded-full border-2 border-pop-dark font-bold">+</button>
                      <button onClick={() => removeFromCart(i.id)} className="ml-auto text-sm font-bold text-red-500 underline">{t('cart.remove')}</button>
                    </div>
                  </div>
                  <div className="font-display font-bold">{formatPrice(p.price * i.qty)}</div>
                </div>
              )
            })}
          </div>
          <div className="bg-pop-dark text-white rounded-3xl p-6 h-fit shadow-pop space-y-2">
            <h2 className="font-display font-bold text-2xl">{t('cart.summary')}</h2>
            <VoucherBox />
            <div className="flex justify-between mt-2 font-bold text-white/80"><span>{t('cart.subtotal')}</span><span>{formatPrice(cartTotal)}</span></div>
            {voucher && <div className="flex justify-between font-bold text-green-300"><span>{t('voucher.discount')} ({voucher.code})</span><span>−{formatPrice(voucherDiscount)}</span></div>}
            {bundleDiscount > 0 && <div className="flex justify-between font-bold text-green-300"><span>{t('bundle.name')}</span><span>−{formatPrice(bundleDiscount)}</span></div>}
            {bundleDiscount === 0 && apparelQty > 0 && apparelQty < 3 && <p className="text-xs font-bold text-pop-yellow">+{3 - apparelQty} apparel → {t('bundle.name')}</p>}
            <div className="flex justify-between font-bold text-white/80"><span>{t('cart.shipping')}</span><span>{shipping === 0 ? t('cart.free') : formatPrice(shipping)}</span></div>
            <div className="border-t border-white/20 mt-1 pt-3 flex justify-between font-display font-bold text-xl"><span>{t('cart.total')}</span><span>{formatPrice(net + shipping)}</span></div>
            {shipping > 0 && <p className="text-xs font-bold text-pop-yellow mt-2">{t('cart.addMore')} {formatPrice(50 - net)} {t('cart.moreForFree')}</p>}
            <Link to="/checkout" className="block text-center mt-2 bg-pop-pink border-2 border-white rounded-full py-3 font-bold hover:bg-pop-orange">{t('cart.checkout')}</Link>
            <Link to="/shop" className="block text-center mt-2 underline text-sm font-bold text-white/70">{t('cart.continue')}</Link>
          </div>
        </div>
      )}
    </div>
  )
}
