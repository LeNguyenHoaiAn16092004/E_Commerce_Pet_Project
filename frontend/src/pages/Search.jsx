import { useSearchParams } from 'react-router-dom'
import { useShop } from '../store/ShopContext.jsx'
import { useLocale } from '../i18n/LocaleContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import SEO from '../components/SEO.jsx'

export default function Search() {
  const [params] = useSearchParams()
  const { products, productsLoading } = useShop()
  const { t } = useLocale()
  const q = (params.get('q') || '').toLowerCase()
  const list = products.filter((p) => (p.name + ' ' + p.category + ' ' + (p.description || '')).toLowerCase().includes(q))
  return (
    <div className="max-w-7xl mx-auto px-4 pt-8">
      <SEO title={`${t('search.results')} ${params.get('q')}`} noIndex />
      <h1 className="font-display font-bold text-4xl">{t('search.results')} “{params.get('q')}” <span className="text-pop-pink">({list.length})</span></h1>
      {productsLoading && <p className="font-bold text-gray-400 mt-4">{t('common.loading')}</p>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      {list.length === 0 && !productsLoading && <p className="font-bold text-gray-500 py-10">{t('search.empty')}</p>}
    </div>
  )
}
