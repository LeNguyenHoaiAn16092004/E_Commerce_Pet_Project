# Deploy ShopFun — Vercel & VPS miễn phí

3 mảnh cần deploy: **web tĩnh** (frontend) + **API Node** (backend) + **PostgreSQL**.
Khuyên dùng combo miễn phí: **Vercel + Render + Neon** (~15 phút, không cần thẻ).

> Nguyên tắc quan trọng: `VITE_API_URL` được **nhúng cứng lúc build** frontend —
> đổi URL backend là phải build/deploy lại web.

## Phương án A (khuyên dùng): Vercel + Render + Neon

```
Browser ──HTTPS──▶ shopfun.vercel.app (Vercel: web tinh)
     └──HTTPS──▶ shopfun-api.onrender.com (Render: Express)
                       └──SSL──▶ Neon Postgres (free)
```

### Bước 1 — Database free trên Neon

1. Đăng ký https://neon.tech → **New Project** (region Singapore cho nhanh từ VN),
   tên DB `shopfun`
2. Copy **Connection string** dạng:
   `postgres://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/shopfun?sslmode=require`
3. Chạy migrate từ máy bạn (trỏ tạm sang DB Neon):

```powershell
cd backend
$env:DATABASE_URL="postgres://...neon.tech/shopfun?sslmode=require"
npm run db:migrate   # tao bang + seed admin/customer/voucher/san pham
```

> Thay thế: Supabase (https://supabase.com → New project → lấy connection
> string ở phần Connect). Cả hai đều có free tier đủ dùng demo.

### Bước 2 — Backend lên Render (free)

**Cách nhanh nhất (1 click):** repo đã có `render.yaml` blueprint + `backend/Dockerfile`
(đã test build OK). Push code lên GitHub rồi mở:

```
https://render.com/deploy?repo=<URL-GitHub-cua-ban>
```

Render tự tạo **API + Postgres + JWT secret ngẫu nhiên**. Sau đó chỉ cần điền `FRONTEND_URL`
= domain Vercel (Render → service → Environment).

> Free tier **không** chạy `preDeployCommand` và **không** có Shell, nên migrate
> bằng tay từ máy bạn (1 lần duy nhất): vào dashboard → database `shopfun-db` →
> copy **External Database URL** → chạy local:
>
> ```powershell
> cd backend
> $env:DATABASE_URL="<External-Database-URL>"
> npm run db:migrate   # phai thay [migrate] OK
> Remove-Item Env:\DATABASE_URL
> ```
>
> Code `db.js` đã tự bật SSL khi nối DB remote nên lệnh trên chạy được ngay.

**Cách thủ công** (nếu không dùng blueprint):
1. https://render.com → **New → Web Service** → chọn repo
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - Instance: **Free**
3. Tab **Environment**, thêm biến (bỏ qua `DATABASE_URL` nếu dùng DB của blueprint):

| Key | Giá trị |
|-----|---------|
| `DATABASE_URL` | connection string Neon ở bước 1 |
| `JWT_SECRET` | secret ngẫu nhiên 32+ ký tự (tạo mới, **không** dùng secret local) |
| `FRONTEND_URL` | `https://shopfun.vercel.app` (sửa lại sau khi có domain Vercel) |
| `NODE_ENV` | `production` |
| `COOKIE_SAMESITE` | `none` (xem giải thích bên dưới) |
| `VIETQR_BANK/ACCOUNT/NAME` | STK nhận tiền (nếu có) |
| `PORT` | để Render tự set (code đã đọc `process.env.PORT`) |

4. Deploy → lấy URL dạng `https://shopfun-api.onrender.com`, test:
   `GET https://shopfun-api.onrender.com/api/health` → `{"ok":true,"db":"connected"}`

**Vì sao `COOKIE_SAMESITE=none`?** Web (Vercel) và API (Render) khác domain
→ cookie cross-site. Trình duyệt chỉ gửi cookie `SameSite=None; Secure`, mà
`Secure` đòi **https cả 2 đầu** (Vercel/Render đều https sẵn nên OK). Code đã hỗ
trợ qua biến này (mặc định `lax` khi chạy cùng site/localhost).

> Free Render **ngủ sau 15p không traffic** (request đầu ~30–60s để tỉnh).
> Giữ tỉnh bằng cron-job.org ping `/api/health` mỗi 14 phút.

### Bước 3 — Frontend lên Vercel (free)

Chi tiết từng click xem **[docs/DEPLOY_VERCEL.md](DEPLOY_VERCEL.md)**. Tóm tắt:

1. https://vercel.com → **Add New → Project** → import repo GitHub
   - **Root Directory**: `frontend` (quan trọng!)
   - Framework: Vite (tự nhận), Build: `npm run build`, Output: `dist`
   - File `frontend/vercel.json` trong repo đã lo rewrite SPA (`/cart`, `/admin`…
     refresh không 404)
2. **Environment Variables**: `VITE_API_URL=https://shopfun-api.onrender.com`
3. Deploy → nhận `https://shopfun.vercel.app`
4. Quay lại Render sửa `FRONTEND_URL` đúng domain Vercel → redeploy backend

### Bước 4 — Kiểm tra sau deploy

- [ ] Web load, chấm cạnh logo **xanh** (API LIVE)
- [ ] Đổi quốc gia VN → giá hiện ₫
- [ ] Login `admin@shopfun.com` → vào `/admin`, cookie `token` có flag
      `Secure + SameSite=None` (DevTools → Application → Cookies)
- [ ] Áp voucher `WELCOME10`, đặt 1 đơn COD, quay Spin 1 lần
- [ ] **Đổi mật khẩu** 3 tài khoản seed ở `/profile`

## Phương án B: VPS free nguyên combo (mạnh nhất, tốn công nhất)

**Oracle Cloud Always Free** (2 VM ARM 4CPU/24GB — mạnh nhất trong các free
tier) hoặc bất kỳ VPS nào (Contabo, Hetzner rẻ ~4–5$/tháng).

1. Cài Docker trên VPS, copy project lên, sửa `docker-compose.yml` thêm backend:

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: shopfun
      POSTGRES_PASSWORD: ${DB_PASSWORD:?dat mat khau manh}
      POSTGRES_DB: shopfun
    volumes:
      - shopfun-pg:/var/lib/postgresql/data
  api:
    build: ./backend
    environment:
      DATABASE_URL: postgres://shopfun:${DB_PASSWORD:?dat mat khau manh}@db:5432/shopfun
      JWT_SECRET: ${JWT_SECRET:?32+ ky tu}
      FRONTEND_URL: https://shop.example.com
      NODE_ENV: production
    depends_on: [db]
volumes:
  shopfun-pg:
```

(kèm `backend/Dockerfile`: `FROM node:20-alpine` → `npm ci --omit=dev` →
`CMD ["node","src/index.js"]` + chạy migrate 1 lần:
`docker compose run --rm api npm run db:migrate`)

2. Build frontend local (`npm run build`), copy `frontend/dist` lên `/srv/web`
3. Cài **Caddy** (tự cấp HTTPS, khỏi lo certbot):

```
shop.example.com {
  handle /api/* {
    reverse_proxy 127.0.0.1:5000
  }
  handle {
    root * /srv/web
    try_files {path} /index.html
    file_server
  }
}
```

4. Mở firewall 80/443, trỏ DNS về IP VPS. Cùng 1 domain → cookie `lax` mặc
   định là đủ, **không** cần `COOKIE_SAMESITE=none`.

## Bảng so sánh free tier (2026)

| Dịch vụ | Dùng cho | Free | Giới hạn đáng chú ý |
|---|---|---|---|
| Vercel Hobby | Frontend | ✔ Free | 100GB bandwidth/tháng; đủ cho demo |
| Render Free | Backend | ✔ Free | Ngủ sau 15p; 750 giờ/tháng |
| Neon Free | Postgres | ✔ Free | ~0.5GB, autoscale về 0 khi idle (tỉnh lại sau vài giây) |
| Supabase Free | Postgres | ✔ Free | 500MB, pause sau 7 ngày không dùng |
| Koyeb Free | Backend (thay Render) | ✔ Free | Không ngủ? kiểm tra chính sách hiện hành |
| Fly.io | Backend | allowances | 3 VM shared trong hạn mức free |
| Oracle Always Free | VPS nguyên combo | ✔ Free vĩnh viễn | Setup phức tạp, cần thẻ visa xác minh |

## Xử lý sự cố deploy

| Triệu chứng | Cách fix |
|---|---|
| Web báo DEMO vàng, không login được | `VITE_API_URL` sai → sửa env trên Vercel → **Redeploy** (env build-time!) |
| CORS error trong console | `FRONTEND_URL` trên backend chưa khớp domain Vercel (kể cả `https://`, không `/` cuối) |
| Login xong mà callsau 401 | Cookie bị chặn: thiếu `COOKIE_SAMESITE=none` hoặc 1 đầu không https |
| Vercel refresh `/admin` → 404 | Thiếu `frontend/vercel.json` rewrites (repo đã có sẵn) |
| Render báo thiếu `PORT` | Không cần set — code đọc port Render cấp; đừng hardcode 5000 |
| Neon `sslmode` lỗi | Connection string phải có `?sslmode=require` |
| Request đầu chậm 30–60s | Free tier đang "tỉnh dậy" — bình thường, dùng cron ping giữ ấm |
| Muốn log backend | Render → service → **Logs**; lỗi 5xx xem `console.error` trong code |
