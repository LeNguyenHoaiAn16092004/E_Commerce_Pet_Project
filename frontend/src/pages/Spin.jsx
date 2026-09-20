import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useShop } from '../store/ShopContext.jsx'
import { useLocale } from '../i18n/LocaleContext.jsx'
import SEO from '../components/SEO.jsx'

const PRIZES = [
  { label: 'WELCOME10 −10%', code: 'WELCOME10', w: 30, color: '#FF3D8A' },
  { label: '+50 pts', points: 50, w: 25, color: '#00C2A8' },
  { label: 'SAVE5 −$5', code: 'SAVE5', w: 20, color: '#FF7A1A' },
  { label: '+100 pts', points: 100, w: 12, color: '#7C3AED' },
  { label: 'SALE20 −20%', code: 'SALE20', w: 8, color: '#FFC93D' },
  { label: '☹', points: 0, w: 5, color: '#CBD5E1' },
]

const today = () => new Date().toISOString().slice(0, 10)
const lastSpin = () => { try { return localStorage.getItem('shopfun-spin') } catch { return null } }

export default function Spin() {
  const { user, earnPoints } = useShop()
  const { t } = useLocale()
  const nav = useNavigate()
  const [angle, setAngle] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [won, setWon] = useState(null)
  const [copied, setCopied] = useState(false)
  const used = lastSpin() === today()

  const segs = useMemo(() => {
    const total = PRIZES.reduce((s, p) => s + p.w, 0)
    let acc = 0
    return PRIZES.map((p) => {
      const from = (acc / total) * 360
      acc += p.w
      return { ...p, from, to: (acc / total) * 360 }
    })
  }, [])

  const pick = () => {
    const total = PRIZES.reduce((s, p) => s + p.w, 0)
    let r = Math.random() * total
    for (const p of PRIZES) { r -= p.w; if (r <= 0) return p }
    return PRIZES[0]
  }

  const spin = () => {
    if (spinning || used || !user) return
    setSpinning(true); setWon(null); setCopied(false)
    const prize = pick()
    const idx = PRIZES.indexOf(prize)
    const seg = segs[idx]
    const mid = (seg.from + seg.to) / 2
    const spins = 5 * 360
    // Kim o dinh (0deg); xoay de mid toi dinh
    const target = spins + (360 - mid) + (angle % 360 > 0 ? 360 - (angle % 360) : 0)
    const next = angle + target
    setAngle(next)
    setTimeout(() => {
      try { localStorage.setItem('shopfun-spin', today()) } catch { /* ignore */ }
      setWon(prize)
      if (prize.points) earnPoints(prize.points)
      setSpinning(false)
    }, 3200)
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(won.code); setCopied(true) } catch { /* ignore */ }
  }

  const bg = `conic-gradient(${segs.map((s) => `${s.color} ${s.from}deg ${s.to}deg`).join(',')})`

  return (
    <div className="max-w-2xl mx-auto px-4 pt-10 text-center">
      <SEO title={t('spin.title')} desc={t('spin.sub')} />
      <h1 className="font-display font-bold text-4xl md:text-5xl">{t('spin.title')}</h1>
      <p className="font-bold text-gray-500 mt-2">{t('spin.sub')}</p>
      {!user && <p className="mt-3 font-bold text-sm">{t('spin.login')} → <Link to="/login" state={{ from: '/spin' }} className="text-pop-pink underline">{t('nav.login')}</Link></p>}

      <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto mt-8">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-pop-dark" />
        <div className="w-full h-full rounded-full border-8 border-pop-dark shadow-pop overflow-hidden transition-transform duration-[3200ms] ease-out" style={{ transform: `rotate(${angle}deg)`, background: bg }}>
          {segs.map((s, i) => {
            const mid = (s.from + s.to) / 2
            return (
              <span key={i} className="absolute left-1/2 top-1/2 font-extrabold text-xs md:text-sm text-white drop-shadow-[1px_1px_0_#1E1B34]" style={{ transform: `translate(-50%,-50%) rotate(${mid}deg) translateY(-118px)`, writingMode: 'vertical-rl' }}>
                {s.label}
              </span>
            )
          })}
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-pop-dark text-white grid place-items-center font-display font-bold border-4 border-white shadow-xl">SPIN</div>
      </div>

      <button onClick={spin} disabled={spinning || used || !user} className="mt-8 bg-pop-pink text-white font-bold rounded-full px-12 py-4 text-xl border-2 border-pop-dark shadow-pop disabled:opacity-40 active:scale-95 transition">
        {spinning ? t('spin.spinning') : used ? t('spin.todayUsed') : t('spin.spin')}
      </button>

      {won && (
        <div className="mt-6 bg-white border-2 border-pop-dark rounded-3xl p-6 shadow-pop">
          <div className="w-16 h-16 mx-auto rounded-full bg-pop-yellow border-2 border-pop-dark grid place-items-center font-display font-bold text-3xl">★</div>
          <h2 className="font-display font-bold text-3xl mt-2">{t('spin.youWon')} {won.label}</h2>
          {won.code && (
            <div className="flex gap-2 justify-center mt-4">
              <button onClick={copy} className="bg-pop-yellow border-2 border-pop-dark rounded-full px-6 py-2.5 font-bold shadow-pop-sm">{copied ? t('spin.copied') : won.code + ' ⧉'}</button>
              <Link to="/cart" className="bg-pop-dark text-white rounded-full px-6 py-2.5 font-bold">{t('spin.use')}</Link>
            </div>
          )}
        </div>
      )}
      <div className="mt-6">
        <button onClick={() => nav('/shop')} className="font-bold underline text-sm">← Shop</button>
      </div>
    </div>
  )
}
