import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useShop } from '../store/ShopContext.jsx'
import { useLocale } from '../i18n/LocaleContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Reviews from '../components/Reviews.jsx'
import SEO from '../components/SEO.jsx'

export default function ProductDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user, products, productsLoading, addToCart, toggleWishlist, wishlist, setCartOpen } = useShop()
  const { t, formatPrice } = useLocale()
  const p = products.find((x) => x.id === id)
  const [qty, setQtyLocal] = useState(1)
  if (productsLoading && !p) return <div className="max-w-3xl mx-auto p-10 text-center font-bold">{t('common.loading')}</div>
  if (!p) return <div className="max-w-3xl mx-auto p-10 text-center font-bold">{t('detail.notFound')} <Link to="/shop" className="underline">{t('detail.back')}</Link></div>
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4)
  const wished = wishlist.includes(p.id)
  return (
    <div className="max-w-7xl mx-auto px-4 pt-8">
      <SEO
        title={p.name}
        desc={p.description}
        image={p.image}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.name,
          image: p.image,
          description: p.description,
          category: p.category,
          aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews },
          offers: { '@type': 'Offer', priceCurrency: 'USD', price: p.price, availability: 'https://schema.org/InStock' },
        }}
      />
      <Link to="/shop" className="font-bold underline">{t('detail.back')}</Link>
      <div className="grid md:grid-cols-2 gap-8 mt-4">
        <div className="relative">
          <img src={p.image} alt={p.name} className="w-full aspect-square object-cover rounded-[2rem] border-4 border-pop-dark shadow-pop" />
          {p.badge && <span className="absolute top-4 left-4 bg-pop-pink text-white font-extrabold px-4 py-1.5 rounded-full border-2 border-pop-dark rotate-[-6deg]">{p.badge}</span>}
        </div>
        <div>
          <div className="text-sm font-extrabold uppercase tracking-widest text-pop-purple">{p.category}</div>
          <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight">{p.name}</h1>
          <div className="font-bold text-amber-500 mt-2">★ {p.rating} <span className="text-gray-400">({Number(p.reviews || 0).toLocaleString()})</span></div>
          <div className="flex items-center gap-3 mt-3">
            <span className="font-display font-bold text-4xl">{formatPrice(p.price)}</span>
            {p.oldPrice && <><span className="line-through text-gray-400 font-bold">{formatPrice(p.oldPrice)}</span><span className="bg-green-400 border-2 border-pop-dark rounded-full px-3 py-0.5 text-sm font-extrabold">{t('detail.saved')} {formatPrice(p.oldPrice - p.price)}</span></>}
          </div>
          <p className="mt-4 font-semibold text-gray-700">{p.description}</p>
          <div className="flex gap-2 mt-4">{(p.colors || []).map((c) => <span key={c} style={{ background: c }} className="w-8 h-8 rounded-full border-2 border-pop-dark" />)}</div>
          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center gap-2 border-2 border-pop-dark rounded-full px-2 py-1.5 bg-white">
              <button onClick={() => setQtyLocal(Math.max(1, qty - 1))} className="w-8 h-8 rounded-full bg-orange-100 font-bold">-</button>
              <span className="font-bold w-6 text-center">{qty}</span>
              <button onClick={() => setQtyLocal(qty + 1)} className="w-8 h-8 rounded-full bg-orange-100 font-bold">+</button>
            </div>
            <button onClick={() => { if (!user) { nav('/login', { state: { from: `/product/${p.id}` } }); return } addToCart(p.id, qty); setCartOpen(true) }} className="flex-1 bg-pop-pink text-white font-bold rounded-full py-3.5 border-2 border-pop-dark shadow-pop hover:bg-pop-orange active:scale-95 transition">{t('card.add')}</button>
            <button onClick={() => toggleWishlist(p.id)} className={`w-13 h-13 p-3.5 rounded-full border-2 border-pop-dark font-bold text-xl ${wished ? 'bg-pop-pink text-white' : 'bg-white'}`}>{wished ? '♥' : '♡'}</button>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-6 text-center text-sm font-bold">
            {[[t('detail.perk1')], [t('detail.perk2')], [t('detail.perk3')]].map(([b]) => <div key={b} className="bg-white border-2 border-pop-dark rounded-2xl p-3"><div className="text-gray-700 text-xs">{b}</div></div>)}
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display font-bold text-3xl mb-4">{t('detail.related')}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </div>
      )}
      <Reviews productId={p.id} />
    </div>
  )
}
