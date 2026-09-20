# Deploy Frontend lên Vercel — Từng bước

Thời gian: ~10 phút. Kết quả: web chạy ở `https://<ten-project>.vercel.app`.

## Chuẩn bị (làm trước)

- [ ] Code đã push lên GitHub (cả `frontend/`, `render.yaml`, `docs/`)
- [ ] Backend đã deploy (Render theo `render.yaml`, hoặc chạy local để test) và bạn
      có **API URL**, VD: `https://shopfun-api.onrender.com`
- [ ] Biết `VITE_API_URL` sẽ dùng = API URL trên (không `/` ở cuối)

> `VITE_API_URL` được **nhúng cứng vào lúc build** — gõ sai là phải sửa + deploy
> lại. Kiểm tra kỹ trước khi bấm Deploy.

## Bước 1 — Đưa code lên GitHub

```powershell
cd D:\Project\test-project-5
git status
git add .
git commit -m "chore: san sang deploy (vercel.json, render.yaml, docs)"
git branch -M main
git remote add origin https://github.com/<ten-ban>/shopfun.git
git push -u origin main
```

## Bước 2 — Tạo tài khoản Vercel

1. Mở https://vercel.com/signup → **Continue with GitHub** → cấp quyền cho repo
   `shopfun` (có thể chọn "Only select repositories" cho gọn)

## Bước 3 — Import project

1. Dashboard Vercel → **Add New… → Project** → tìm repo `shopfun` → **Import**
2. Tại màn **Configure Project**, chỉnh 3 chỗ (quan trọng nhất):

| Mục | Giá trị | Vì sao |
|-----|---------|--------|
| **Root Directory** | `frontend` → bấm **Edit** rồi chọn | Repo là monorepo, code web nằm trong `frontend/` |
| Framework Preset | **Vite** (tự nhận) | Build `npm run build`, Output `dist` |
| **Environment Variables** | `VITE_API_URL` = `https://shopfun-api.onrender.com` | Web gọi API ở đâu |

3. File `frontend/vercel.json` trong repo đã lo rewrite SPA — **không cần**
   động gì thêm (refresh `/cart`, `/admin`… không bị 404)
4. Bấm **Deploy** → đợi ~1–2 phút → nhận URL `https://shopfun-xxx.vercel.app`

## Bước 4 — Nối backend (bắt buộc, hay quên nhất)

1. Sang **Render** → service `shopfun-api` → **Environment** → sửa:
   `FRONTEND_URL=https://shopfun-xxx.vercel.app` (đúng domain Vercel vừa nhận,
   có `https://`, không `/` cuối) → **Save** (tự redeploy)
2. Kiểm tra backend đã có `COOKIE_SAMESITE=none` (có sẵn trong `render.yaml`)

## Bước 5 — Kiểm tra (checklist)

- [ ] Mở web: chấm cạnh logo **xanh** (API LIVE). Vàng = sai `VITE_API_URL`
- [ ] Đổi quốc gia VN → giá hiện **₫**
- [ ] Login `customer@shopfun.com` → về trang chính `/`
- [ ] Login `admin@shopfun.com` → vào `/admin`
- [ ] F12 → Application → Cookies: có `token` với `Secure + SameSite=None`
- [ ] Áp mã `WELCOME10` ở giỏ hàng, đặt 1 đơn COD, quay Spin
- [ ] Refresh thử ở `/admin`, `/cart` → vẫn hiện trang (không 404)

## Bước 6 — Quy trình cập nhật sau này

```powershell
git add .; git commit -m "mo ta thay doi"; git push
```

Vercel **tự build + deploy lại** mỗi lần push lên `main` (1–2 phút). Mỗi pull
request còn được cấp URL preview riêng để test trước khi merge. Muốn quay về
bản cũ: tab **Deployments** → bản cũ → **⋯ → Promote to Production**.

## Đổi `VITE_API_URL` / thêm biến môi trường

Vercel → project → **Settings → Environment Variables** → sửa/thêm →
**bắt buộc Redeploy** (Deployments → bản mới nhất → **⋯ → Redeploy**), vì biến
`VITE_*` chỉ có tác dụng lúc build.

## Lỗi thường gặp

| Triệu chứng | Cách fix |
|---|---|
| Trang trắng / `404 NOT_FOUND` sau deploy | Sai **Root Directory** — phải là `frontend`, redeploy lại |
| Refresh `/cart`, `/admin` → 404 | Thiếu `frontend/vercel.json` (repo đã có — kiểm tra file còn không) |
| Chấm vàng DEMO, login báo "Backend offline" | `VITE_API_URL` sai → sửa env → **Redeploy** |
| CORS error trong console (F12) | `FRONTEND_URL` ở backend chưa khớp domain Vercel |
| Login xong mà request sau 401 | Cookie cross-site bị chặn: backend thiếu `COOKIE_SAMESITE=none`, hoặc 1 đầu không https |
| Build fail `npm ci` | `frontend/package-lock.json` lệch — chạy `npm install` local rồi push lại |
| Muốn domain riêng | Vercel → **Settings → Domains** → thêm domain → trỏ DNS theo hướng dẫn → nhớ sửa `FRONTEND_URL` bên backend theo |
