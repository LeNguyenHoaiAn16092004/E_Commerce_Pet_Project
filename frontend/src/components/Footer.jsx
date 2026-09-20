import { Link } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleContext.jsx'

export default function Footer() {
  const { t } = useLocale()
  return (
    <footer className="mt-16 bg-pop-dark text-white rounded-t-[2.5rem] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="font-display font-bold text-2xl mb-2">Shop<span className="text-pop-yellow">Fun</span></div>
          <p className="text-white/70 text-sm">{t('footer.tag')}</p>
          <div className="flex gap-2 mt-4">
            {['IG', 'TT', 'X', 'YT'].map((s) => <span key={s} className="w-9 h-9 grid place-items-center rounded-full bg-white/15 font-bold text-xs hover:bg-pop-pink cursor-pointer">{s}</span>)}
          </div>
        </div>
        <div>
          <div className="font-bold mb-3 text-pop-yellow">{t('footer.shop')}</div>
          {['All products', 'Sneakers', 'Apparel', 'Gadgets', 'Sale'].map((x) => <Link key={x} to="/shop" className="block text-white/70 hover:text-white text-sm py-1">{x}</Link>)}
        </div>
        <div>
          <div className="font-bold mb-3 text-pop-yellow">{t('footer.account')}</div>
          {[{ t: t('footer.login'), l: '/login' }, { t: t('footer.register'), l: '/register' }, { t: t('footer.orders'), l: '/account' }, { t: t('footer.wishlist'), l: '/wishlist' }, { t: t('footer.cart'), l: '/cart' }].map((x) => <Link key={x.t} to={x.l} className="block text-white/70 hover:text-white text-sm py-1">{x.t}</Link>)}
        </div>
        <div>
          <div className="font-bold mb-3 text-pop-yellow">{t('footer.news')}</div>
          <p className="text-white/70 text-sm mb-3">{t('footer.newsSub')}</p>
          <form onSubmit={(e) => e.preventDefault()} className="flex">
            <input placeholder="Email" className="w-full rounded-l-2xl px-4 py-2.5 text-pop-dark outline-none" />
            <button className="bg-pop-pink rounded-r-2xl px-4 font-bold hover:bg-pop-orange">{t('footer.join')}</button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/15 text-center text-xs text-white/60 py-4">{t('footer.rights')}</div>
    </footer>
  )
}
