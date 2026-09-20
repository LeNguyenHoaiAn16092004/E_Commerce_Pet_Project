import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useShop } from '../store/ShopContext.jsx'
import { useLocale } from '../i18n/LocaleContext.jsx'
import { api } from '../lib/api.js'
import SEO from '../components/SEO.jsx'

export default function Profile() {
  const { user, refreshMe } = useShop()
  const { t } = useLocale()
  const [name, setName] = useState(user?.name || '')
  const [msg, setMsg] = useState(null)
  const [saving, setSaving] = useState(false)
  const [curPw, setCurPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwMsg, setPwMsg] = useState(null)
  const [pwBusy, setPwBusy] = useState(false)

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true); setMsg(null)
    try {
      await api.updateProfile({ name })
      await refreshMe()
      setMsg({ ok: true, text: t('profile.saved') })
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const changePw = async (e) => {
    e.preventDefault(); setPwBusy(true); setPwMsg(null)
    try {
      await api.changePassword({ currentPassword: curPw, newPassword: newPw })
      setCurPw(''); setNewPw('')
      setPwMsg({ ok: true, text: t('profile.pwDone') })
    } catch (err) {
      setPwMsg({ ok: false, text: err.message })
    } finally {
      setPwBusy(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 pt-8">
      <SEO title={t('profile.title')} noIndex />
      <Link to="/account" className="font-bold underline">{t('profile.back')}</Link>
      <h1 className="font-display font-bold text-4xl mt-2">{t('profile.title')}</h1>

      <form onSubmit={saveProfile} className="mt-4 bg-white border-2 border-pop-dark rounded-3xl p-6 shadow-pop-sm grid gap-3">
        <label className="font-bold text-sm">{t('profile.name')}
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border-2 border-pop-dark rounded-2xl px-4 py-2.5 outline-none focus:bg-yellow-50" />
        </label>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><div className="font-bold text-gray-400">{t('profile.email')}</div><div className="font-bold">{user?.email}</div></div>
          <div><div className="font-bold text-gray-400">{t('profile.role')}</div><div className="font-bold">{user?.role}</div></div>
        </div>
        {msg && <p className={`text-sm font-bold ${msg.ok ? 'text-green-600' : 'text-red-500'}`}>{msg.text}</p>}
        <button disabled={saving} className="bg-pop-dark text-white rounded-full py-3 font-bold disabled:opacity-50">{saving ? '…' : t('profile.save')}</button>
      </form>

      <form onSubmit={changePw} className="mt-4 bg-white border-2 border-pop-dark rounded-3xl p-6 shadow-pop-sm grid gap-3">
        <h2 className="font-display font-bold text-2xl">{t('profile.pwTitle')}</h2>
        <input value={curPw} onChange={(e) => setCurPw(e.target.value)} type="password" placeholder={t('profile.curPw')} required className="border-2 border-pop-dark rounded-2xl px-4 py-2.5 outline-none" />
        <input value={newPw} onChange={(e) => setNewPw(e.target.value)} type="password" placeholder={t('profile.newPw')} required minLength={6} className="border-2 border-pop-dark rounded-2xl px-4 py-2.5 outline-none" />
        {pwMsg && <p className={`text-sm font-bold ${pwMsg.ok ? 'text-green-600' : 'text-red-500'}`}>{pwMsg.text}</p>}
        <button disabled={pwBusy} className="bg-pop-pink text-white border-2 border-pop-dark rounded-full py-3 font-bold shadow-pop-sm disabled:opacity-50">{pwBusy ? '…' : t('profile.change')}</button>
      </form>
    </div>
  )
}
