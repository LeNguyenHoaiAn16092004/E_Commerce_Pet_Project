import { Link } from 'react-router-dom'
import { useShop } from '../store/ShopContext.jsx'
import { useLocale } from '../i18n/LocaleContext.jsx'
import VoucherBox from './VoucherBox.jsx'

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, removeFromCart, cartTotal, voucherDiscount, bundleDiscount, products } = useShop()
  const { t, formatPrice } = useLocale()
  if (!cartOpen) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-pop-dark/50" onClick={() => setCartOpen(false)} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-[#FFF7ED] border-l-4 border-pop-dark flex flex-col">
        <div className="p-5 flex items-center justify-between border-b-2 border-dashed border-pop-dark/20">
          <h2 className="font-display font-bold text-2xl">{t('cart.drawer')}</h2>
          <button onClick={() => setCartOpen(false)} className="w-10 h-10 rounded-full bg-white border-2 border-pop-dark font-bold">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cart.length === 0 && <p className="text-center font-bold text-gray-500 mt-10">{t('cart.emptyDrawer')}<br /><Link to="/shop" onClick={() => setCartOpen(false)} className="inline-block mt-4 bg-pop-yellow border-2 border-pop-dark rounded-full px-6 py-2 shadow-pop-sm">{t('cart.goShopping')}</Link></p>}
          {cart.map((i) => {
            const p = products.find((x) => x.id === i.id)
            if (!p) return null
            return (
              <div key={i.id} className="flex gap-3 bg-white rounded-2xl border-2 border-pop-dark p-3">
                <img src={p.image} alt={p.name} className="w-20 h-20 rounded-xl object-cover border-2 border-pop-dark/10" />
                <div className="flex-1">
                  <div className="font-bold text-sm leading-tight">{p.name}</div>
                  <div className="font-display font-bold">{formatPrice(p.price)}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => setQty(i.id, i.qty - 1)} className="w-7 h-7 rounded-full border-2 border-pop-dark font-bold">-</button>
                    <span className="font-bold">{i.qty}</span>
                    <button onClick={() => setQty(i.id, i.qty + 1)} className="w-7 h-7 rounded-full border-2 border-pop-dark font-bold">+</button>
                    <button onClick={() => removeFromCart(i.id)} className="ml-auto text-xs font-bold text-red-500 underline">{t('cart.remove')}</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {cart.length > 0 && (
          <div className="p-5 border-t-2 border-dashed border-pop-dark/20 bg-white space-y-3">
            <VoucherBox />
            <div className="flex justify-between font-display font-bold text-xl"><span>{t('cart.subtotal')}</span><span>{formatPrice(cartTotal - voucherDiscount - bundleDiscount)}</span></div>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/cart" onClick={() => setCartOpen(false)} className="text-center border-2 border-pop-dark rounded-full py-2.5 font-bold">{t('cart.viewCart')}</Link>
              <Link to="/checkout" onClick={() => setCartOpen(false)} className="text-center bg-pop-pink text-white border-2 border-pop-dark rounded-full py-2.5 font-bold shadow-pop-sm">{t('cart.checkout')}</Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
