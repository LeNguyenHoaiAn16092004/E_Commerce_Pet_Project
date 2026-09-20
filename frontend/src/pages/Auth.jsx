import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useShop } from '../store/ShopContext.jsx'
import { useLocale } from '../i18n/LocaleContext.jsx'
import SEO from '../components/SEO.jsx'

function afterLoginNav(u, nav, from) {
  // u = null nghia la loi (sai pass, trung email, rate-limit...) -> o lai, loi hien qua authError.
  // Admin vao thang dashboard, customer ve trang truoc do, mac dinh la trang chinh.
  if (!u) return
  if (u.role === 'admin') nav('/admin', { replace: true })
  else nav(from, { replace: true })
}

export function Login() {
  const { login, authLoading, authError, apiOnline } = useShop()
  const { t } = useLocale()
  const nav = useNavigate()
  const loc = useLocation()
  const from = loc.state?.from || '/'
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    const u = await login(email || 'guest@shopfun.com', pw || 'demo')
    afterLoginNav(u, nav, from)
  }
  return (
    <div className="max-w-md mx-auto px-4 pt-12">
      <SEO title={t('auth.loginBtn')} noIndex />
      <div className="bg-white border-2 border-pop-dark rounded-[2rem] p-8 shadow-pop">
        <h1 className="font-display font-bold text-3xl">{t('auth.welcome')}</h1>
        <p className="font-bold text-gray-500 text-sm mt-1">{t('auth.loginSub')} {!apiOnline && t('auth.demo')}</p>
        <form onSubmit={submit} className="grid gap-3 mt-6">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.email')} type="email" required className="border-2 border-pop-dark rounded-2xl px-4 py-3 outline-none focus:bg-yellow-50" />
          <input value={pw} onChange={(e) => setPw(e.target.value)} placeholder={t('auth.password')} type="password" required className="border-2 border-pop-dark rounded-2xl px-4 py-3 outline-none focus:bg-yellow-50" />
          {authError && <p className="text-sm font-bold text-red-500">{authError}</p>}
          <button disabled={authLoading} className="bg-pop-pink text-white border-2 border-pop-dark rounded-full py-3 font-bold shadow-pop-sm disabled:opacity-50">{authLoading ? t('auth.loggingIn') : t('auth.loginBtn')}</button>
        </form>
        <p className="text-sm font-bold text-center mt-4">{t('auth.noAcc')} <Link to="/register" className="text-pop-pink underline">{t('auth.registerLink')}</Link></p>
      </div>
    </div>
  )
}

export function Register() {
  const { register, authLoading, authError, apiOnline } = useShop()
  const { t } = useLocale()
  const nav = useNavigate()
  const loc = useLocation()
  const from = loc.state?.from || '/'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    const u = await register(name || 'New Friend', email || 'friend@shopfun.com', pw || 'demo')
    afterLoginNav(u, nav, from)
  }
  return (
    <div className="max-w-md mx-auto px-4 pt-12">
      <div className="bg-white border-2 border-pop-dark rounded-[2rem] p-8 shadow-pop">
        <h1 className="font-display font-bold text-3xl">{t('auth.join')}</h1>
        <p className="font-bold text-gray-500 text-sm mt-1">{t('auth.joinSub')} {!apiOnline && t('auth.demo')}</p>
        <form onSubmit={submit} className="grid gap-3 mt-6">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('auth.name')} required className="border-2 border-pop-dark rounded-2xl px-4 py-3 outline-none focus:bg-yellow-50" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.email')} type="email" required className="border-2 border-pop-dark rounded-2xl px-4 py-3 outline-none focus:bg-yellow-50" />
          <input value={pw} onChange={(e) => setPw(e.target.value)} placeholder={t('auth.password')} type="password" required className="border-2 border-pop-dark rounded-2xl px-4 py-3 outline-none focus:bg-yellow-50" />
          {authError && <p className="text-sm font-bold text-red-500">{authError}</p>}
          <button disabled={authLoading} className="bg-pop-teal text-white border-2 border-pop-dark rounded-full py-3 font-bold shadow-pop-sm disabled:opacity-50">{authLoading ? t('auth.creating') : t('auth.create')}</button>
        </form>
        <p className="text-sm font-bold text-center mt-4">{t('auth.haveAcc')} <Link to="/login" className="text-pop-pink underline">{t('auth.loginLink')}</Link></p>
      </div>
    </div>
  )
}
