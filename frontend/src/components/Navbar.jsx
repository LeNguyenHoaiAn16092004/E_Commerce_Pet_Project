import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useShop } from '../store/ShopContext.jsx'
import { useLocale } from '../i18n/LocaleContext.jsx'
import { COUNTRIES } from '../i18n/locales.js'

export default function Navbar() {
  const { cartCount, wishlist, user, setCartOpen, logout, apiOnline } = useShop()
  const { t, countryCode, setCountry, country } = useLocale()
  const [q, setQ] = useState('')
  const nav = useNavigate()
  return (
    <header className="sticky top-0 z-40">
      <div className="bg-pop-dark text-white text-center text-xs sm:text-sm font-bold py-2 px-4">
        <div className="overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-marquee">
            <span className="mx-6">{t('nav.promo1')}</span>•<span className="mx-6">{t('nav.promo2')}</span>•<span className="mx-6">{t('nav.promo3')}</span>•<span className="mx-6">{t('nav.promo1')}</span>•<span className="mx-6">{t('nav.promo2')}</span>•<span className="mx-6">{t('nav.promo3')}</span>
          </div>
        </div>
      </div>
      <nav className="bg-white/90 backdrop-blur border-b-4 border-pop-dark">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pop-pink via-pop-orange to-pop-yellow border-2 border-pop-dark shadow-pop-sm grid place-items-center font-display font-bold text-white text-xl">S</span>
            <span className="font-display font-bold text-2xl tracking-tight">Shop<span className="text-pop-pink">Fun</span></span>
            <span title={apiOnline ? 'Backend API connected' : 'Demo mode (backend offline)'} className={`w-2.5 h-2.5 rounded-full border border-pop-dark ${apiOnline ? 'bg-green-400' : 'bg-pop-yellow'}`} />
          </Link>
          <form onSubmit={(e) => { e.preventDefault(); nav(`/search?q=${encodeURIComponent(q)}`) }} className="hidden md:flex flex-1 max-w-xl mx-auto">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('nav.searchPh')} className="w-full rounded-l-full border-2 border-r-0 border-pop-dark px-5 py-2.5 outline-none focus:bg-yellow-50" />
            <button className="rounded-r-full bg-pop-dark text-white px-5 font-bold border-2 border-pop-dark hover:bg-pop-purple">{t('nav.search')}</button>
          </form>
          <div className="flex items-center gap-2 ml-auto">
            <select value={countryCode} onChange={(e) => setCountry(e.target.value)} title={`${country.name} • ${country.currency}`} className="font-bold text-sm border-2 border-pop-dark rounded-full px-2 py-2 bg-white cursor-pointer">
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.code} • {c.currency}</option>)}
            </select>
            <NavLink to="/shop" className="hidden sm:block font-bold px-3 py-2 rounded-full hover:bg-orange-100">{t('nav.shop')}</NavLink>
            <NavLink to="/spin" className="hidden sm:block font-bold px-3 py-2 rounded-full hover:bg-yellow-100">Spin</NavLink>
            <NavLink to="/wishlist" className="relative font-bold px-3 py-2 rounded-full hover:bg-pink-100">♥<span className="ml-1 text-xs bg-pop-pink text-white rounded-full px-2 py-0.5">{wishlist.length}</span></NavLink>
            <button onClick={() => setCartOpen(true)} className="relative bg-pop-yellow border-2 border-pop-dark rounded-full px-4 py-2 font-bold shadow-pop-sm hover:-translate-y-0.5 transition">{t('nav.cart')} ({cartCount})</button>
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/account" className="bg-pop-teal text-white border-2 border-pop-dark rounded-full px-4 py-2 font-bold shadow-pop-sm">{user.name}</Link>
                <button onClick={logout} className="text-sm font-bold underline">{t('nav.logout')}</button>
              </div>
            ) : (
              <Link to="/login" className="bg-pop-dark text-white rounded-full px-4 py-2 font-bold border-2 border-pop-dark hover:bg-pop-purple">{t('nav.login')}</Link>
            )}
          </div>
        </div>
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={(e) => { e.preventDefault(); nav(`/search?q=${encodeURIComponent(q)}`) }} className="flex">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('nav.searchPhShort')} className="w-full rounded-l-full border-2 border-r-0 border-pop-dark px-4 py-2 outline-none" />
            <button className="rounded-r-full bg-pop-dark text-white px-4 font-bold border-2 border-pop-dark">{t('nav.go')}</button>
          </form>
        </div>
      </nav>
    </header>
  )
}
