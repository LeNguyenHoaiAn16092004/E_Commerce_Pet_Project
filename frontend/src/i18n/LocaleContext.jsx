import { createContext, useContext, useMemo, useState } from 'react'
import { COUNTRIES, RATES, STR } from './locales.js'

const LocaleContext = createContext(null)
const loadCountry = () => {
  try { return localStorage.getItem('shopfun-country') || 'VN' } catch { return 'VN' }
}

export function LocaleProvider({ children }) {
  const [countryCode, setCountryCode] = useState(loadCountry)
  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0]
  const lang = country.lang

  const setCountry = (code) => {
    setCountryCode(code)
    try { localStorage.setItem('shopfun-country', code) } catch { /* ignore */ }
  }

  const t = (key) => STR[lang]?.[key] ?? STR.en[key] ?? key

  // Gia goc USD -> tien te quoc gia, dinh dang theo locale
  const formatPrice = (usd) => {
    const rate = RATES[country.currency] || 1
    const v = Number(usd || 0) * rate
    const noDecimal = country.currency === 'VND' || country.currency === 'JPY'
    return new Intl.NumberFormat(country.locale, {
      style: 'currency',
      currency: country.currency,
      maximumFractionDigits: noDecimal ? 0 : 2,
      minimumFractionDigits: noDecimal ? 0 : 2,
    }).format(v)
  }

  const value = useMemo(
    () => ({ country, countryCode, setCountry, lang, t, formatPrice }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [countryCode, lang]
  )
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export const useLocale = () => useContext(LocaleContext)
