import { Link } from 'react-router-dom'
import { useShop } from '../store/ShopContext.jsx'
import { useLocale } from '../i18n/LocaleContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import SEO from '../components/SEO.jsx'

export default function Wishlist() {
  const { wishlist, products, productsLoading } = useShop()
  const { t } = useLocale()
  const items = products.filter((p) => wishlist.includes(p.id))
  return (
    <div className="max-w-7xl mx-auto px-4 pt-8">
      <SEO title={t('wish.title')} noIndex />
      <h1 className="font-display font-bold text-4xl">{t('wish.title')} ({items.length})</h1>
      {productsLoading && <p className="font-bold text-gray-400 mt-4">{t('common.loading')}</p>}
      {items.length === 0 && !productsLoading ? <div className="text-center py-16 bg-white border-2 border-pop-dark rounded-3xl shadow-pop mt-6"><p className="font-display font-bold text-2xl">{t('wish.emptyT')}</p><Link to="/shop" className="inline-block mt-4 bg-pop-pink text-white border-2 border-pop-dark rounded-full px-8 py-3 font-bold shadow-pop-sm">{t('wish.emptyB')}</Link></div>
      : <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>}
    </div>
  )
}
