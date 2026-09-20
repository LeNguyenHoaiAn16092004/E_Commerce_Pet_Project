import { useState } from 'react'
import { useLocale } from '../i18n/LocaleContext.jsx'

const RULES = [
  { k: ['ship', 'giao', 'vận chuyển', 'delivery'], vi: 'Shop miễn phí ship cho đơn từ $50, giao trong 24h nội thành, 2-4 ngày toàn quốc nhé!', en: 'Free shipping over $50! Local delivery in 24h, nationwide 2–4 days.' },
  { k: ['voucher', 'mã', 'giảm', 'discount', 'coupon', 'code'], vi: 'Mã đang chạy: WELCOME10 (−10%), SALE20 (−20% đơn $100+), SAVE5 (−$5 đơn $30+). Nhập ở giỏ hàng nhé! Quay Spin mỗi ngày để trúng thêm!', en: 'Active codes: WELCOME10 (−10%), SALE20 (−20% on $100+), SAVE5 (−$5 on $30+). Enter them in the cart! Spin daily for more!' },
  { k: ['đổi', 'trả', 'return', 'refund', 'hoàn'], vi: 'Đổi trả miễn phí trong 30 ngày nếu lỗi hoặc không vừa ý. Liên hệ shop để được hỗ trợ!', en: 'Free 30-day returns for defects or wrong size. Contact us anytime!' },
  { k: ['thanh toán', 'payment', 'pay', 'chuyển khoản', 'cod'], vi: 'Shop nhận COD và chuyển khoản VietQR (quét mã đúng số tiền ở bước thanh toán).', en: 'We accept COD and VietQR bank transfer (scan the exact amount at checkout).' },
  { k: ['chào', 'hello', 'hi', 'hey'], vi: 'Chào bạn! Mình giúp gì được nào?', en: 'Hi there! How can I help?' },
  { k: ['cảm ơn', 'thanks', 'thank'], vi: 'Không có chi! Chúc bạn mua sắm vui vẻ!', en: "You're welcome! Happy shopping!" },
]

export default function ChatWidget() {
  const { t, lang } = useLocale()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState([{ from: 'bot', text: t('chat.hello') }])

  const reply = (text) => {
    const low = text.toLowerCase()
    for (const r of RULES) {
      if (r.k.some((k) => low.includes(k))) return lang === 'vi' ? r.vi : r.en
    }
    return lang === 'vi'
      ? 'Mình ghi nhận rồi nhé! Shop online 8h–22h mỗi ngày. Bạn hỏi về ship, voucher, đổi trả hay thanh toán?'
      : 'Noted! We are online 8am–10pm daily. Ask me about shipping, vouchers, returns or payment?'
  }

  const send = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setMsgs((m) => [...m, { from: 'me', text }])
    setInput('')
    setTimeout(() => setMsgs((m) => [...m, { from: 'bot', text: reply(text) }]), 500)
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="w-80 max-w-[calc(100vw-2.5rem)] bg-white border-2 border-pop-dark rounded-3xl shadow-pop overflow-hidden mb-3">
          <div className="bg-pop-dark text-white font-display font-bold px-4 py-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" /> {t('chat.title')}
            <button onClick={() => setOpen(false)} className="ml-auto font-bold">✕</button>
          </div>
          <div className="h-64 overflow-y-auto p-3 space-y-2 bg-orange-50/50">
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm font-semibold ${m.from === 'me' ? 'ml-auto bg-pop-pink text-white' : 'bg-white border-2 border-pop-dark/10'}`}>{m.text}</div>
            ))}
          </div>
          <form onSubmit={send} className="flex border-t-2 border-pop-dark/10">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('chat.ph')} className="flex-1 px-4 py-2.5 outline-none text-sm" />
            <button className="px-4 font-bold text-pop-pink">➤</button>
          </form>
        </div>
      )}
      <button onClick={() => setOpen(!open)} aria-label="chat" className="w-14 h-14 rounded-full bg-pop-pink text-white border-2 border-pop-dark shadow-pop hover:scale-105 transition grid place-items-center">
        {open ? <span className="font-bold text-xl">✕</span> : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
        )}
      </button>
    </div>
  )
}
