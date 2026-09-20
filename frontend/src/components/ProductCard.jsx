import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useShop } from '../store/ShopContext.jsx'
import { useLocale } from '../i18n/LocaleContext.jsx'

export default function ProductCard({ p }) {
  const { user, addToCart, wishlist, toggleWishlist } = useShop()
  const { t, formatPrice } = useLocale()
  const nav = useNavigate()
  const loc = useLocation()
  const wished = wishlist.includes(p.id)
  const handleAdd = () => {
    if (!user) { nav('/login', { state: { from: loc.pathname } }); return }
    addToCart(p.id)
  }
  return (
    <div className="group bg-white rounded-3xl border-2 border-pop-dark shadow-pop overflow-hidden hover:-translate-y-1.5 transition-transform">
      <div className="relative">
        <Link to={`/product/${p.id}`}>
          <img src={p.image} alt={p.name} loading="lazy" className="w-full aspect-square object-cover" />
        </Link>
        {p.badge && <span className="absolute top-3 left-3 bg-pop-pink text-white text-xs font-extrabold px-3 py-1 rounded-full border-2 border-pop-dark rotate-[-6deg]">{p.badge}</span>}
        <button onClick={() => toggleWishlist(p.id)} aria-label="wishlist" className={`absolute top-3 right-3 w-10 h-10 grid place-items-center rounded-full border-2 border-pop-dark font-bold text-lg ${wished ? 'bg-pop-pink text-white' : 'bg-white'}`}>{wished ? '♥' : '♡'}</button>
      </div>
      <div className="p-4">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-pop-purple">{p.category}</div>
        <Link to={`/product/${p.id}`} className="font-display font-semibold text-lg leading-tight hover:text-pop-pink">{p.name}</Link>
        <div className="text-sm font-bold text-amber-500 mt-1">★ {p.rating} <span className="text-gray-400 font-semibold">({Number(p.reviews || 0).toLocaleString()})</span></div>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-display font-bold text-xl">{formatPrice(p.price)}</span>
          {p.oldPrice && <span className="line-through text-gray-400 font-bold text-sm">{formatPrice(p.oldPrice)}</span>}
        </div>
        <button onClick={handleAdd} className="mt-3 w-full bg-pop-dark text-white font-bold rounded-full py-2.5 border-2 border-pop-dark hover:bg-pop-pink active:scale-95 transition">{t('card.add')}</button>
      </div>
    </div>
  )
}
