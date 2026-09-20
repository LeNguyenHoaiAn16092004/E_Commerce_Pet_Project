# ShopFun — Sàn thương mại điện tử vui vẻ

Full-stack e-commerce: **React + Vite + Tailwind** (frontend) + **Express + PostgreSQL**
(backend). Giao diện nhiều màu sắc, song ngữ Việt/Anh, đa tiền tệ (mặc định Việt
Nam — VND), voucher, vòng quay may mắn, điểm thưởng, đánh giá sản phẩm, thanh
toán COD/VietQR.

## Tính năng chính

**Mua sắm**

- Trang chủ (hero, shop theo vibe, trending, sale), cửa hàng với **bộ lọc nâng
  cao** (từ khóa, khoảng giá, sao tối thiểu, chỉ hàng sale, 4 kiểu sắp xếp)
- Chi tiết sản phẩm (màu sắc, số lượng, tiết kiệm, sản phẩm liên quan, JSON-LD SEO)
- Giỏ hàng (drawer + trang riêng), free-ship đơn từ $50
- Checkout 3 bước, **bắt buộc đăng nhập**, lưu đơn vào database
- Tìm kiếm, wishlist, lịch sử đơn hàng

**Khuyến mãi & gamification**

- **Voucher**: `WELCOME10` (−10%), `SALE20` (−20% đơn $100+), `SAVE5` (−$5 đơn
  $30+) — server tự tính, chống dùng mã hết lượt/hết hạn
- **Combo động**: ≥3 món apparel tự −15% (server + app cùng công thức)
- **Lucky Spin** (`/spin`): mỗi ngày 1 lượt, trúng voucher hoặc điểm
- **Điểm & hạng**: mua hàng, review (+50), điểm danh (+20/ngày) → 5 hạng từ
  Mới đến Kim cương
- Chat hỗ trợ tự động (bot theo từ khóa, 2 ngôn ngữ)

**Tài khoản & quản trị**

- Đăng nhập/đăng ký (JWT + httpOnly cookie), sửa hồ sơ, đổi mật khẩu
- Login **admin vào thẳng dashboard**, customer về trang chính
- Dashboard admin: CRUD sản phẩm, quản lý voucher, xem doanh thu/đơn hàng
- **Reviews**: mỗi user 1 đánh giá/SP, điểm trung bình tự cập nhật
- **Thanh toán**: COD hoặc chuyển khoản **VietQR** (QR đúng số tiền VND)

**Kỹ thuật**

- Song ngữ VI/EN + 4 quốc gia (VN•VND, US•USD, JP•JPY, DE•EUR), giá USD gốc
  tự quy đổi theo tỉ giá
- SEO: title/description/OG từng trang, `noindex` trang private, JSON-LD Product
- Bảo mật: helmet, CORS whitelist + cookie, CSRF double-submit, rate-limit,
  bcrypt 13, validate đầu vào, giá/voucher/combo do server tính

## Yêu cầu

- Node.js 20+, npm
- Docker Desktop (đang chạy) **hoặc** PostgreSQL local
- Lưu ý Windows: nếu đã có PostgreSQL native chiếm port `5432`, project dùng
  port **`5433`** cho container (xem `docker-compose.yml`)

## Chạy nhanh (5 phút)

```powershell
# 1. Database (can Docker Desktop dang chay)
docker compose up -d db

# 2. Backend (http://localhost:5000)
cd backend
copy .env.example .env   # sua JWT_SECRET, VietQR neu can
npm install
npm run db:migrate       # tao bang + seed du lieu
npm run dev

# 3. Frontend (http://localhost:5173) — mo terminal moi
cd ../frontend
npm install
npm run dev
```

Mở `http://localhost:5173` — chấm xanh cạnh logo = API LIVE, vàng = chế độ demo
(offline, dùng mock + localStorage).

## Tài khoản test (đã seed)

| Vai trò  | Email                  | Mật khẩu           | Vào đâu sau login |
|----------|------------------------|--------------------|--------------------|
| Admin    | `admin@shopfun.com`    | `Admin@ShopFun2026!` | `/admin`         |
| Admin 2  | `admin2@shopfun.com`   | `Admin2@ShopFun2026!` | `/admin`        |
| Customer | `customer@shopfun.com` | `Customer@123456`  | `/` (trang chính) |

> Đổi mật khẩu ngay ở `/profile` sau khi nhận bàn giao.

## Cấu hình (.env backend)

| Biến | Mặc định | Mô tả |
|------|----------|-------|
| `DATABASE_URL` | `postgres://shopfun:shopfun123@localhost:5433/shopfun` | Chuỗi kết nối Postgres |
| `PORT` | `5000` | Port API |
| `JWT_SECRET` | *(bắt buộc ≥32 ký tự)* | Tạo mới: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `FRONTEND_URL` | `http://localhost:5173` | Domain frontend (CORS whitelist, cách nhau dấu phẩy) |
| `NODE_ENV` | `development` | `production` → cookie `Secure`, trust proxy |
| `VIETQR_BANK/ACCOUNT/NAME` | *(trống = chỉ COD)* | VD: `MB / 0123456789 / NGUYEN VAN A` |

Frontend: `frontend/.env` (copy từ `.env.example`):

```
VITE_API_URL=http://localhost:5000
```

## Scripts

| Thư mục | Lệnh | Tác dụng |
|---------|------|----------|
| root | `docker compose up -d db` | Chạy PostgreSQL 16 (port 5433) |
| `backend` | `npm run dev` | API + watch mode |
| `backend` | `npm start` | Chạy production |
| `backend` | `npm run db:migrate` | Chạy `sql/schema.sql` (idempotent — chạy lại an toàn) |
| `frontend` | `npm run dev` | Web dev `:5173` |
| `frontend` | `npm run build` | Build production → `frontend/dist` |

## Cấu trúc

```
test-project-5/
├── README.md                  # file nay
├── docs/API.md                # tai lieu API chi tiet + vi du
├── docker-compose.yml         # Postgres 16 (host port 5433)
├── backend/
│   ├── src/
│   │   ├── index.js           # app: helmet, CORS, cookie, CSRF, routes
│   │   ├── config.js          # JWT secret, cookie, CORS, bcrypt rounds
│   │   ├── db.js              # pg Pool
│   │   ├── migrate.js         # chay sql/schema.sql
│   │   ├── middleware/auth.js # JWT (cookie uu tien) + adminOnly
│   │   └── routes/            # auth, products, reviews, orders, vouchers
│   ├── sql/schema.sql         # bang + seed (users, products, vouchers...)
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx            # routes + guards (RequireAuth)
    │   ├── components/        # Navbar, Footer, ProductCard, CartDrawer,
    │   │                      # VoucherBox, Reviews, SEO, ChatWidget...
    │   ├── pages/             # Home Shop ProductDetail Cart Checkout Auth
    │   │                      # Account Profile Wishlist Search Admin Spin
    │   ├── store/ShopContext.jsx  # cart, auth, orders, voucher, points
    │   ├── i18n/              # locales (vi/en) + LocaleContext (quoc gia/tien te)
    │   ├── lib/api.js         # fetch client (cookie + CSRF + retry)
    │   └── data/products.js   # mock fallback khi backend offline
    └── .env.example           # VITE_API_URL
```

Bảng database: `users`, `products`, `orders`, `order_items`, `vouchers`,
`reviews`. Chi tiết endpoint xem **[docs/API.md](docs/API.md)**.

## Quy tắc nghiệp vụ (server là chuẩn)

- **Voucher**: `%` hoặc `$` cố định, `min_order`, `max_uses`, `expires_at` —
  server validate + tự trừ, tăng `used_count` mỗi đơn thành công
- **Combo**: giỏ có ≥3 món `apparel` → −15% tiền hàng apparel
- **Điểm**: đơn hàng +`floor(tổng)`, review +50, điểm danh +20/ngày; hạng theo
  mốc 0 / 300 / 1000 / 3000 / 8000 điểm
- **Review**: 1 user/SP (gửi lại = cập nhật), xóa chỉ chủ hoặc admin
- **Đơn hàng**: tổng = subtotal − voucher − combo; free-ship từ $50 (tính trên
  tổng sau giảm)

## Bảo mật (đã triển khai)

- JWT secret ≥32 ký tự (thiếu/yếu → sinh tạm + cảnh báo, session mất khi restart)
- bcrypt cost 13; chống user-enumeration ở login (so sánh hằng thời gian)
- Rate-limit: login 10 lần/15p, register 10/giờ, dò voucher 30/15p, review 10/15p
- Session httpOnly cookie (`SameSite=Lax`, `Secure` khi production) + CSRF
  double-submit cho mọi POST/PUT/DELETE
- CORS whitelist theo `FRONTEND_URL` (cookie không chạy với `*`)
- Helmet headers; JSON body giới hạn 100kb; lỗi 4xx không tạo session demo

## Xử lý sự cố

| Lỗi | Nguyên nhân / cách fix |
|-----|------------------------|
| `open //./pipe/dockerDesktopLinuxEngine` | Docker Desktop chưa chạy → mở Docker Desktop, đợi engine rồi chạy lại |
| `password authentication failed for user "shopfun"` | Port 5432 bị Postgres khác chiếm → project đã dùng **5433**, kiểm tra `DATABASE_URL` |
| Chấm vàng DEMO / toast "Backend offline" | Backend chưa chạy hoặc sai `VITE_API_URL` — app vẫn xem được bằng mock |
| Login 403 `EBADCSRFTOKEN` | Cookie bị chặn (trình duyệt chặn 3rd-party) — chạy frontend/backend cùng `localhost` là hết |
| Login 429 | Thử sai quá 10 lần/15p — đợi rồi thử lại |
| Admin login không vào `/admin` | Sai mật khẩu sẽ hiện lỗi đỏ trên form (không còn im lặng); đúng pass `role=admin` luôn vào dashboard |

## Roadmap gợi ý

VNPay/MoMo sandbox, gửi mail xác nhận đơn, trang chi tiết/tracking đơn, upload
ảnh sản phẩm, phân trang + tìm kiếm full-text phía server, test tự động (vitest +
supertest), CI/CD + Dockerfile production.
