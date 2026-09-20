export const CATEGORIES = [
  { id: 'all', name: 'All goodies', color: 'bg-pop-dark text-white' },
  { id: 'sneakers', name: 'Sneakers', color: 'bg-pop-pink text-white' },
  { id: 'apparel', name: 'Apparel', color: 'bg-pop-orange text-white' },
  { id: 'accessories', name: 'Accessories', color: 'bg-pop-purple text-white' },
  { id: 'gadgets', name: 'Gadgets', color: 'bg-pop-teal text-white' },
  { id: 'home', name: 'Home fun', color: 'bg-pop-yellow text-pop-dark' },
]

const img = (seed, w = 800) => `https://picsum.photos/seed/${seed}/${w}/${w}`

export const PRODUCTS = [
  { id: 'p1', name: 'Bubblegum Runner Sneakers', price: 89.99, oldPrice: 129.99, rating: 4.8, reviews: 2314, category: 'sneakers', badge: 'HOT', colors: ['#FF3D8A', '#7C3AED', '#FFC93D'], image: img('shopfun-sneaker1'), description: 'Super bouncy foam sole, breathable knit, and colors that pop from blocks away. Your feet will thank you.' },
  { id: 'p2', name: 'Sunny Side Hoodie', price: 59.5, oldPrice: 79, rating: 4.9, reviews: 1876, category: 'apparel', badge: 'NEW', colors: ['#FFC93D', '#FF7A1A'], image: img('shopfun-hoodie'), description: 'Heavyweight fleece hoodie in sunshine yellow. Oversized fit, kangaroo pocket, zero bad days.' },
  { id: 'p3', name: 'Pop Backpack Pro', price: 74, oldPrice: null, rating: 4.7, reviews: 932, category: 'accessories', badge: null, colors: ['#2563EB', '#00C2A8'], image: img('shopfun-backpack'), description: '22L water-resistant backpack with padded laptop sleeve, secret snack pocket, and rainbow zip pulls.' },
  { id: 'p4', name: 'Boom Bluetooth Speaker', price: 129, oldPrice: 159, rating: 4.6, reviews: 1204, category: 'gadgets', badge: '-20%', colors: ['#7C3AED', '#1E1B34'], image: img('shopfun-speaker'), description: '360° party sound, 24h battery, IPX7 waterproof. Pair two for stereo boom.' },
  { id: 'p5', name: 'Cloudsoft Denim Jacket', price: 98, oldPrice: null, rating: 4.8, reviews: 764, category: 'apparel', badge: null, colors: ['#2563EB'], image: img('shopfun-denim'), description: 'Classic denim with a fun twist — embroidered patches included so you can DIY the back.' },
  { id: 'p6', name: 'Twisty Desk Lamp', price: 45.99, oldPrice: 65, rating: 4.5, reviews: 543, category: 'home', badge: 'SALE', colors: ['#FFC93D', '#FF3D8A', '#00C2A8'], image: img('shopfun-lamp'), description: 'Bendable neon-style LED lamp with 3 color temps. Makes any desk 10x happier.' },
  { id: 'p7', name: 'Retro High-Tops', price: 110, oldPrice: null, rating: 4.9, reviews: 3211, category: 'sneakers', badge: 'BEST', colors: ['#FF7A1A', '#1E1B34'], image: img('shopfun-hightop'), description: 'Throwback silhouette, modern comfort. Cushioned collar and grippy gum sole.' },
  { id: 'p8', name: 'Pixel Smart Watch', price: 199, oldPrice: 249, rating: 4.7, reviews: 2109, category: 'gadgets', badge: '-20%', colors: ['#1E1B34', '#FF3D8A'], image: img('shopfun-watch'), description: 'AMOLED display, heart + sleep tracking, 10-day battery, 100+ fun watch faces.' },
  { id: 'p9', name: 'Happy Plant Pot Set', price: 32, oldPrice: null, rating: 4.6, reviews: 421, category: 'home', badge: null, colors: ['#00C2A8', '#FFC93D'], image: img('shopfun-pots'), description: 'Set of 3 smiley ceramic pots with drainage. Plants not included, good vibes included.' },
  { id: 'p10', name: 'Candy Striped Tee', price: 29.99, oldPrice: 39.99, rating: 4.4, reviews: 689, category: 'apparel', badge: 'SALE', colors: ['#FF3D8A', '#fff'], image: img('shopfun-tee'), description: '100% organic cotton tee with bold candy stripes. Soft, breathable, endlessly matchable.' },
  { id: 'p11', name: 'Snapback Fun Cap', price: 24.99, oldPrice: null, rating: 4.5, reviews: 356, category: 'accessories', badge: null, colors: ['#7C3AED', '#FF7A1A'], image: img('shopfun-cap'), description: 'Adjustable snapback with embroidered smiley. One size fits most happy heads.' },
  { id: 'p12', name: 'Zoom Drone Mini', price: 149, oldPrice: 189, rating: 4.6, reviews: 874, category: 'gadgets', badge: 'NEW', colors: ['#2563EB', '#1E1B34'], image: img('shopfun-drone'), description: '4K mini drone with auto-follow, 30min flight time, and one-tap tricks.' },
]

export const formatPrice = (n) => `$${Number(n || 0).toFixed(2)}`

// Chuyen row Postgres -> dang frontend dang dung (price la string NUMERIC -> number)
export const normalizeProduct = (r) => ({
  id: r.id,
  name: r.name,
  price: Number(r.price),
  oldPrice: r.old_price != null ? Number(r.old_price) : (r.oldPrice != null ? Number(r.oldPrice) : null),
  rating: Number(r.rating || 0),
  reviews: Number(r.reviews || 0),
  category: r.category,
  badge: r.badge || null,
  colors: r.colors || ['#FF3D8A', '#7C3AED', '#FFC93D'],
  image: r.image,
  description: r.description || '',
  stock: r.stock ?? 100,
})

export const normalizeOrder = (o) => ({
  ...o,
  total: Number(o.total),
  date: o.date || o.created_at,
  items: (o.items || []).map((i) => ({
    id: i.product_id || i.id,
    qty: Number(i.qty),
    price: Number(i.price),
    name: i.name,
    image: i.image,
  })),
})
