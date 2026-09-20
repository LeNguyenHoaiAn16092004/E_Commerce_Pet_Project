# ShopFun API — Tài liệu endpoint

Base URL: `http://localhost:5000`. Mọi response lỗi có dạng `{ "message": "..." }`.

## Xác thực & CSRF (đọc trước)

- **Session**: login/register thành công → server set cookie `token` (httpOnly,
  7 ngày). Các request sau browser tự gửi cookie (`credentials: include`).
  Tương thích ngược: gửi `Authorization: Bearer <token>` cũng được.
- **CSRF**: mọi `POST/PUT/PATCH/DELETE` dưới `/api` cần header `x-csrf-token`.
  Lấy token: `GET /api/csrf-token` → `{ "csrfToken": "..." }` (token gắn với
  cookie `sid`, ổn định trước/sau login; sai → `403 { code: "EBADCSRFTOKEN" }`,
  lấy token mới và thử lại 1 lần).
- Frontend đã bọc sẵn tất cả trong `frontend/src/lib/api.js`.

Ví dụ curl (giữ cookie + csrf):

```bash
# lay csrf + cookie
curl -c jar.txt http://localhost:5000/api/csrf-token
# CSRF=<token vua nhan>; gui kem -b jar.txt -H "x-csrf-token: $CSRF"
curl -b jar.txt -c jar.txt -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' -H "x-csrf-token: $CSRF" \
  -d '{"email":"customer@shopfun.com","password":"Customer@123456"}'
```

## Hệ thống

### `GET /api/health`

Không cần auth. Kiểm tra DB.

```json
{ "ok": true, "db": "connected" }
```

### `GET /api/config`

Public. Cấu hình VietQR + tỉ giá cho frontend.

```json
{ "vietqr": { "bank": "MB", "account": "0123", "name": "SHOPFUN" }, "usdToVnd": 25000 }
```

### `GET /api/csrf-token`

Lấy CSRF token (xem trên).

## Auth — `/api/auth`

| Method & path | Auth | Body | Ghi chú |
|---|---|---|---|
| `POST /register` | CSRF + rate-limit 10/giờ | `{ name, email, password≥6 }` | `201 { user, token }`, trùng email → 409 |
| `POST /login` | CSRF + rate-limit 10/15p | `{ email, password }` | Sai → 401 (không phân biệt email/pass) |
| `POST /logout` | CSRF | — | Xóa cookie |
| `GET /me` | login | — | `{ id, name, email, role, created_at }` |
| `PUT /me` | login + CSRF | `{ name }` | Đổi tên (tối đa 100 ký tự) |
| `PUT /password` | login + CSRF | `{ currentPassword, newPassword≥6 }` | Sai pass cũ → 401 |

`user.role`: `customer` | `admin`.

## Products — `/api/products`

| Method & path | Auth | Query/Body |
|---|---|---|
| `GET /` | không | `?cat=&q=&max=` (lọc category, từ khóa, giá tối đa USD) |
| `GET /:id` | không | — (404 nếu không có) |
| `POST /` | **admin** + CSRF | `{ name*, price*≥0, category*, old_price?, rating?, badge?, image?, description?, stock?, id? }` (id tự sinh nếu thiếu; trùng → 409) |
| `PUT /:id` | **admin** + CSRF | các field trên (partial update) |
| `DELETE /:id` | **admin** + CSRF | — → `{ ok: true }` |

Product:

```json
{ "id": "p1", "name": "...", "price": "89.99", "old_price": "129.99",
  "rating": "4.8", "reviews": 2314, "category": "sneakers", "badge": "HOT",
  "image": "...", "description": "...", "stock": 100 }
```

> Lưu ý: `price/old_price/rating` là NUMERIC → JSON trả về **string**, frontend
> dùng `normalizeProduct()` chuyển sang number.

## Reviews

| Method & path | Auth | Body |
|---|---|---|
| `GET /api/products/:id/reviews` | không | — |
| `POST /api/products/:id/reviews` | login + CSRF + rate-limit 10/15p | `{ rating* 1–5, title? ≤100, comment? ≤1000 }` (mỗi user 1 review/SP, gửi lại = cập nhật; điểm trung bình SP tự tính lại) |
| `DELETE /api/reviews/:reviewId` | chủ review hoặc admin + CSRF | — |

`GET` trả về:

```json
{ "summary": { "count": 12, "avg": "4.6", "s5": 8, "s4": 2, "s3": 1, "s2": 1, "s1": 0 },
  "reviews": [{ "id": 1, "rating": 5, "title": "...", "comment": "...",
                "created_at": "...", "user_name": "Test Customer", "user_id": "uuid" }] }
```

## Orders — `/api/orders` (đều cần login)

### `POST /`

Tạo đơn. **Server tự tính lại toàn bộ** (giá, voucher, combo) — client chỉ gửi
id + số lượng.

```json
{
  "items": [{ "product_id": "p10", "qty": 3 }],
  "address": "1 ABC", "city": "HCM", "zip": "70000",
  "voucherCode": "WELCOME10",
  "payment_method": "cod"
}
```

- `payment_method`: `cod` | `vietqr` (sai → `cod`), `payment_status` luôn
  khởi tạo `pending`
- Voucher sai/hết lượt → `400 { message }`; SP không tồn tại → `400`
- `201` trả về order + `items`; xem ví dụ thật: subtotal $149.47,
  voucher −$14.95, combo −$22.42 → `total: 112.10`

### `GET /`

Đơn của mình, mới nhất trước. `GET /:id` = chi tiết 1 đơn + items
(`name`, `image` join từ products).

Order:

```json
{ "id": "ORD-123456", "user_id": "uuid", "total": "112.10",
  "voucher_code": "WELCOME10", "discount": "14.95", "bundle_discount": "22.42",
  "payment_method": "cod", "payment_status": "pending", "status": "Processing",
  "address": "...", "city": "...", "zip": "...", "created_at": "..." }
```

## Vouchers — `/api/vouchers`

| Method & path | Auth | Body |
|---|---|---|
| `POST /validate` | CSRF + rate-limit 30/15p | `{ code, subtotal }` → `200 { code, type, value, min_order, discount }`, sai → 400 |
| `GET /` | **admin** | — (danh sách đầy đủ) |
| `POST /` | **admin** + CSRF | `{ code*, type*: percent\|fixed, value* >0, min_order?, max_uses?, active?, expires_at? }` (code tự UPPERCASE; trùng → 409) |
| `DELETE /:code` | **admin** + CSRF | — |

Voucher mẫu đã seed: `WELCOME10` (10%, min 0), `SALE20` (20%, min $100),
`SAVE5` ($5, min $30).

## Mã lỗi thường gặp

| Status | Nghĩa |
|--------|-------|
| 400 | Thiếu/sai tham số (xem `message`) |
| 401 | Chưa login / sai pass / session hết hạn |
| 403 | Thiếu quyền admin, hoặc CSRF sai (`code: EBADCSRFTOKEN` → lấy token mới) |
| 404 | Không tồn tại |
| 409 | Trùng email / mã voucher / id SP |
| 429 | Vượt rate-limit (login/register/validate/review) — đợi rồi thử lại |
