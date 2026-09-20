import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CATEGORIES } from '../data/products.js'
import { useShop } from '../store/ShopContext.jsx'
import { useLocale } from '../i18n/LocaleContext.jsx'
import ProductCard from '../components/ProductCard.jsx'
import SEO from '../components/SEO.jsx'

const CAT_NAME = {
  en: { all: 'All goodies', sneakers: 'Sneakers', apparel: 'Apparel', accessories: 'Accessories', gadgets: 'Gadgets', home: 'Home fun' },
  vi: { all: 'Tất cả', sneakers: 'Sneaker', apparel: 'Thời trang', accessories: 'Phụ kiện', gadgets: 'Gadget', home: 'Đồ nhà xinh' },
}

export default function Shop() {
  const { products, productsLoading } = useShop()
  const { t, lang, formatPrice } = useLocale()
  const [params, setParams] = useSearchParams()
  const cat = params.get('cat') || 'all'
  const [sort, setSort] = useState('pop')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [saleOnly, setSaleOnly] = useState(false)
  const [keyword, setKeyword] = useState('')

  const catName = (id) => CAT_NAME[lang]?.[id] || CAT_NAME.en[id] || id

  const list = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    let l = products.filter((p) => {
      if (cat !== 'all' && p.category !== cat) return false
      if (minPrice !== '' && Number(p.price) < Number(minPrice)) return false
      if (maxPrice !== '' && Number(p.price) > Number(maxPrice)) return false
      if (Number(p.rating) < minRating) return false
      if (saleOnly && !p.oldPrice) return false
      if (kw && !(p.name + ' ' + p.category + ' ' + (p.description || '')).toLowerCase().includes(kw)) return false
      return true
    })
    if (sort === 'low') l = [...l].sort((a, b) => a.price - b.price)
    if (sort === 'high') l = [...l].sort((a, b) => b.price - a.price)
    if (sort === 'rate') l = [...l].sort((a, b) => b.rating - a.rating)
    return l
  }, [products, cat, sort, minPrice, maxPrice, minRating, saleOnly, keyword])

  const clearAll = () => {
    setParams({}); setSort('pop'); setMinPrice(''); setMaxPrice('')
    setMinRating(0); setSaleOnly(false); setKeyword('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-8">
      <SEO title={t('shop.title')} />
      <h1 className="font-display font-bold text-4xl">{t('shop.title')} <span className="text-pop-pink">({list.length})</span> {productsLoading && <span className="text-lg text-gray-400">{t('common.loading')}</span>}</h1>
      <div className="flex flex-wrap gap-2 mt-4">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setParams(c.id === 'all' ? {} : { cat: c.id })} className={`border-2 border-pop-dark rounded-full px-5 py-2 font-bold shadow-pop-sm ${cat === c.id ? c.color : 'bg-white'}`}>{catName(c.id)}</button>
        ))}
      </div>
      {/* Bo loc nang cao */}
      <div className="mt-4 bg-white border-2 border-pop-dark rounded-3xl p-4 shadow-pop-sm grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <label className="font-bold text-sm">{t('shop.sort')}
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="ml-2 border-2 border-pop-dark rounded-full px-3 py-1.5 font-bold bg-white">
            <option value="pop">{t('shop.pop')}</option>
            <option value="low">{t('shop.low')}</option>
            <option value="high">{t('shop.high')}</option>
            <option value="rate">{t('shop.rate')}</option>
          </select>
        </label>
        <label className="font-bold text-sm flex items-center gap-2">{t('shop.price')}
          <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} type="number" min="0" placeholder={t('shop.min')} className="w-24 border-2 border-pop-dark rounded-full px-3 py-1.5 outline-none" />
          <span>–</span>
          <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number" min="0" placeholder={t('shop.max')} className="w-24 border-2 border-pop-dark rounded-full px-3 py-1.5 outline-none" />
        </label>
        <label className="font-bold text-sm">{t('shop.rating')}
          <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="ml-2 border-2 border-pop-dark rounded-full px-3 py-1.5 font-bold bg-white">
            <option value={0}>{t('shop.anyRating')}</option>
            <option value={4.5}>★ 4.5+</option>
            <option value={4}>★ 4.0+</option>
            <option value={3}>★ 3.0+</option>
          </select>
        </label>
        <label className="font-bold text-sm flex items-center gap-2">
          <input type="checkbox" checked={saleOnly} onChange={(e) => setSaleOnly(e.target.checked)} className="w-5 h-5 accent-pink-500" />
          {t('shop.saleOnly')}
        </label>
        <label className="font-bold text-sm flex items-center gap-2 sm:col-span-2">{t('shop.keyword')}
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={t('shop.keywordPh')} className="flex-1 border-2 border-pop-dark rounded-full px-4 py-1.5 outline-none" />
        </label>
        <div className="sm:col-span-2 lg:col-span-3">
          <button onClick={clearAll} className="text-sm font-bold underline">{t('shop.clear')}</button>
          <span className="ml-3 text-xs font-bold text-gray-400">{t('shop.price')}: {formatPrice(0)} – {formatPrice(250)}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {list.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
      {list.length === 0 && !productsLoading && <p className="text-center font-bold text-gray-500 py-16">{t('shop.empty')}</p>}
    </div>
  )
}
