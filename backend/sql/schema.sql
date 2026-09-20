-- ShopFun schema (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  old_price NUMERIC(10,2),
  rating NUMERIC(2,1) DEFAULT 0,
  reviews INT DEFAULT 0,
  category TEXT NOT NULL,
  badge TEXT,
  image TEXT,
  description TEXT,
  stock INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT ('ORD-' || floor(random()*900000+100000)::text),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  total NUMERIC(10,2) NOT NULL,
  address TEXT,
  city TEXT,
  zip TEXT,
  status TEXT DEFAULT 'Processing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  qty INT NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL
);

-- Voucher / discount codes
CREATE TABLE IF NOT EXISTS vouchers (
  code TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('percent','fixed')),
  value NUMERIC(10,2) NOT NULL CHECK (value > 0),
  min_order NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_uses INT NOT NULL DEFAULT 100,
  used_count INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Don hang luu voucher da dung (chay lai an toan cho DB cu)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS bundle_discount NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cod';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';

-- Danh gia san pham
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

-- Seed admin + customer test
-- tai khoan admin mac dinh: admin@shopfun.com / Admin@ShopFun2026! (doi ngay sau khi dang nhap)
-- tai khoan customer de test: customer@shopfun.com / Customer@123456
INSERT INTO users(name,email,password_hash,role) VALUES
('Admin','admin@shopfun.com','$2a$13$S1vfwvqzzgtUF12BOS0hFe.0am2ZD9pmVu2qUTBmtazjnAunbhqGC', 'admin'),
('Test Customer','customer@shopfun.com','$2a$13$WpAfecvg2zqxTIv5c7QJQudx0dBG9FJtFTn7bChyvas1pwF4VsrOm', 'customer')
ON CONFLICT (email) DO NOTHING;

-- Voucher mau
INSERT INTO vouchers(code,type,value,min_order,max_uses,active) VALUES
('WELCOME10','percent',10,0,1000,TRUE),
('SALE20','percent',20,100,200,TRUE),
('SAVE5','fixed',5,30,500,TRUE)
ON CONFLICT (code) DO NOTHING;

-- Seed products (map voi frontend mock)
INSERT INTO products(id,name,price,old_price,rating,reviews,category,badge,image,description) VALUES
('p1','Bubblegum Runner Sneakers',89.99,129.99,4.8,2314,'sneakers','HOT','https://picsum.photos/seed/shopfun-sneaker1/800/800','Super bouncy foam sole, breathable knit.'),
('p2','Sunny Side Hoodie',59.5,79,4.9,1876,'apparel','NEW','https://picsum.photos/seed/shopfun-hoodie/800/800','Heavyweight fleece hoodie in sunshine yellow.'),
('p3','Pop Backpack Pro',74,NULL,4.7,932,'accessories',NULL,'https://picsum.photos/seed/shopfun-backpack/800/800','22L water-resistant backpack with laptop sleeve.'),
('p4','Boom Bluetooth Speaker',129,159,4.6,1204,'gadgets','-20%','https://picsum.photos/seed/shopfun-speaker/800/800','360 sound, 24h battery, IPX7.'),
('p5','Cloudsoft Denim Jacket',98,NULL,4.8,764,'apparel',NULL,'https://picsum.photos/seed/shopfun-denim/800/800','Classic denim with embroidered patches.'),
('p6','Twisty Desk Lamp',45.99,65,4.5,543,'home','SALE','https://picsum.photos/seed/shopfun-lamp/800/800','Bendable LED lamp, 3 color temps.'),
('p7','Retro High-Tops',110,NULL,4.9,3211,'sneakers','BEST','https://picsum.photos/seed/shopfun-hightop/800/800','Throwback silhouette, modern comfort.'),
('p8','Pixel Smart Watch',199,249,4.7,2109,'gadgets','-20%','https://picsum.photos/seed/shopfun-watch/800/800','AMOLED, heart+sleep tracking, 10-day battery.'),
('p9','Happy Plant Pot Set',32,NULL,4.6,421,'home',NULL,'https://picsum.photos/seed/shopfun-pots/800/800','Set of 3 smiley ceramic pots.'),
('p10','Candy Striped Tee',29.99,39.99,4.4,689,'apparel','SALE','https://picsum.photos/seed/shopfun-tee/800/800','100% organic cotton tee.'),
('p11','Snapback Fun Cap',24.99,NULL,4.5,356,'accessories',NULL,'https://picsum.photos/seed/shopfun-cap/800/800','Adjustable snapback with smiley.'),
('p12','Zoom Drone Mini',149,189,4.6,874,'gadgets','NEW','https://picsum.photos/seed/shopfun-drone/800/800','4K mini drone, 30min flight.')
ON CONFLICT (id) DO NOTHING;
