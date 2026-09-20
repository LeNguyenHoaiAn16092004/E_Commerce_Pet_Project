import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { ShopProvider, useShop } from './store/ShopContext.jsx'
import { HelmetProvider } from 'react-helmet-async'
import { LocaleProvider } from './i18n/LocaleContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import ChatWidget from './components/ChatWidget.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import { Login, Register } from './pages/Auth.jsx'
import Account from './pages/Account.jsx'
import Profile from './pages/Profile.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Search from './pages/Search.jsx'
import Admin from './pages/Admin.jsx'
import Spin from './pages/Spin.jsx'

function Toast() {
  const { toast } = useShop()
  if (!toast) return null
  return <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-pop-dark text-white font-bold rounded-full px-6 py-3 border-2 border-white shadow-2xl">{toast}</div>
}

function NotFound() {
  return <div className="max-w-md mx-auto p-10 text-center"><h1 className="font-display font-bold text-6xl">404</h1><p className="font-bold text-gray-500">Lost in the funhouse?</p><Link to="/" className="inline-block mt-4 bg-pop-yellow border-2 border-pop-dark rounded-full px-8 py-3 font-bold shadow-pop-sm">Go home</Link></div>
}

function RequireAuth({ children }) {
  const { user } = useShop()
  const loc = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  return children
}

export default function App() {
  return (
    <HelmetProvider>
    <LocaleProvider>
    <ShopProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 pb-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account" element={<Account />} />
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/search" element={<Search />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/spin" element={<Spin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <CartDrawer />
          <ChatWidget />
          <Toast />
        </div>
      </BrowserRouter>
    </ShopProvider>
    </LocaleProvider>
    </HelmetProvider>
  )
}
