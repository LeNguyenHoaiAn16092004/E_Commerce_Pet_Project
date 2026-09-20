import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/products.js'
import { useShop } from '../store/ShopContext.jsx'
import { useLocale } from '../i18n/LocaleContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import SEO from '../components/SEO.jsx'

const CAT_NAME = {
  en: { all: 'All goodies', sneakers: 'Sneakers', apparel: 'Apparel', accessories: 'Accessories', gadgets: 'Gadgets', home: 'Home fun' },
  vi: { all: 'Tất cả', sneakers: 'Sneaker', apparel: 'Thời trang', accessories: 'Phụ kiện', gadgets: 'Gadget', home: 'Đồ nhà xinh' },
}

export default function Home() {
  const { products, productsLoading } = useShop()
  const { t, lang, formatPrice } = useLocale()
  const featured = products.slice(0, 4)
  const sale = products.filter((p) => p.oldPrice).slice(0, 4)
  const catName = (id) => CAT_NAME[lang]?.[id] || CAT_NAME.en[id] || id
  const cheapest = products.length ? Math.min(...products.map((p) => Number(p.price))) : 0
  return (
    <div>
      <SEO desc={t('home.sub')} />
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 pt-8">
        <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-pop-dark bg-gradient-to-br from-pop-pink via-pop-orange to-pop-yellow p-8 md:p-14 shadow-pop">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/20 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pop-purple/30 rounded-full blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block bg-white border-2 border-pop-dark rounded-full px-4 py-1 text-sm font-extrabold rotate-[-2deg] shadow-pop-sm">{t('home.badge')}</span>
              <h1 className="font-display font-bold text-5xl md:text-7xl leading-[0.95] mt-4 text-white drop-shadow-[3px_3px_0_#1E1B34]">{t('home.title')}</h1>
              <p className="mt-4 text-white/95 font-bold text-lg max-w-md">{t('home.sub')}</p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link to="/shop" className="bg-pop-dark text-white font-bold rounded-full px-8 py-3.5 border-2 border-pop-dark shadow-[4px_4px_0_#fff] hover:-translate-y-0.5 transition">{t('home.shopNow')}</Link>
                <Link to="/shop?cat=sneakers" className="bg-white font-bold rounded-full px-8 py-3.5 border-2 border-pop-dark shadow-pop-sm hover:-translate-y-0.5 transition">{t('home.sneakers')}</Link>
              </div>
              <div className="flex gap-6 mt-6 text-white font-extrabold text-sm">
                <span>{t('home.stats')}</span>
              </div>
            </div>
            <div className="relative">
              <img src={products[0]?.image} alt="hero" className="rounded-[2rem] border-4 border-white shadow-2xl rotate-2 animate-floaty aspect-square object-cover" />
              <div className="absolute -bottom-4 -left-4 bg-white border-2 border-pop-dark rounded-2xl px-4 py-2 shadow-pop-sm rotate-[-4deg] font-display font-bold">↓ {formatPrice(cheapest)}</div>
              <div className="absolute -top-4 right-8 bg-pop-teal text-white border-2 border-pop-dark rounded-full px-4 py-2 shadow-pop-sm rotate-3 font-bold">{t('home.sale')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <h2 className="font-display font-bold text-3xl mb-4">{t('home.vibe')}</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={c.id === 'all' ? '/shop' : `/shop?cat=${c.id}`} className={`${c.color} border-2 border-pop-dark rounded-full px-6 py-3 font-bold whitespace-nowrap shadow-pop-sm hover:-translate-y-0.5 transition`}>{catName(c.id)}</Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display font-bold text-3xl">{t('home.trending')}</h2>
          <Link to="/shop" className="font-bold underline">{t('home.viewAll')}</Link>
        </div>
        {productsLoading && <p className="font-bold text-gray-400">{t('common.loading')}</p>}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{featured.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      {/* BANNER */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-3xl border-2 border-pop-dark bg-pop-purple text-white p-8 shadow-pop">
            <div className="font-display font-bold text-3xl">{t('home.gadgetT')}</div>
            <p className="font-bold text-white/80">{t('home.gadgetS')}</p>
            <Link to="/shop?cat=gadgets" className="inline-block mt-4 bg-white text-pop-dark font-bold rounded-full px-6 py-2.5 border-2 border-pop-dark">{t('home.gadgetB')}</Link>
          </div>
          <div className="rounded-3xl border-2 border-pop-dark bg-pop-teal text-white p-8 shadow-pop">
            <div className="font-display font-bold text-3xl">{t('home.bundleT')}</div>
            <p className="font-bold text-white/80">{t('home.bundleS')}</p>
            <Link to="/shop?cat=apparel" className="inline-block mt-4 bg-white text-pop-dark font-bold rounded-full px-6 py-2.5 border-2 border-pop-dark">{t('home.bundleB')}</Link>
          </div>
        </div>
      </section>

      {/* SALE */}
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <h2 className="font-display font-bold text-3xl mb-4">{t('home.onSale')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{sale.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>
    </div>
  )
}
