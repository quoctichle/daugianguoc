# Đấu Giá Ngược – Lowest Unique Bid

Hệ thống đấu giá ngược fullstack chạy bằng:

- Nuxt 4.3.1
- Nitro 2.13.1
- Vite 7.3.1
- Vue 3.5.29 (Composition API)
- Prisma + SQLite (database thật)

## Tính năng chính

- Login local theo yêu cầu:
	- Admin cố định: `admin@sunshine.com` / `sunshinetelecom`
	- User: email Gmail bất kỳ (`*@gmail.com`)
- JWT lưu trong `httpOnly cookie`
- Session giữ nguyên khi reload
- Middleware bảo vệ trang `user` và `admin`
- Admin dashboard tách layout riêng
- Quản lý thể lệ đấu giá (lưu DB)
- Quản lý sản phẩm đấu giá + upload ảnh thật
- Trang thống kê đấu giá theo từng sản phẩm
- Tính winner Lowest Unique Bid hoàn toàn ở server

## Cấu trúc chính

```text
components/
	admin/
		DashboardSidebar.vue
		DashboardHeader.vue
		ProductForm.vue
		ProductTable.vue
		AuctionDetailCard.vue
	auction/
		AuctionCard.vue
		BidForm.vue
		CountdownTimer.vue
		WinnerList.vue

layouts/
	admin.vue
	default.vue

pages/
	admin/
		index.vue
		config.vue
		auctions.vue
		auctions/[id].vue
	user.vue

server/
	api/
		auth/
		admin/
		products/
		bids/
	utils/

prisma/
	schema.prisma
	migrations/
```

## Prisma models

- `users`
- `rules`
- `products`
- `bids`
- `winners`

## Cài đặt

1. Cài dependencies:

```bash
npm install
```

2. Tạo file env:

```bash
cp .env.example .env
```

3. Điền biến môi trường trong `.env`:

- `DATABASE_URL="file:./dev.db"`
- `JWT_SECRET="..."`
- `GOOGLE_CLIENT_ID="..."`
- `GOOGLE_CLIENT_SECRET="..."`
- `GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"`
- `ADMIN_EMAILS="admin1@gmail.com,admin2@gmail.com"`

4. Chạy migration:

```bash
npm run prisma:migrate
```

5. Chạy dev server:

```bash
npm run dev
```

## Tài khoản đăng nhập

- Admin: `admin@sunshine.com`
- Password: `sunshinetelecom`
- User: nhập Gmail bất kỳ để vào trang user
- Trang user login: `/`
- Trang admin login: `/admin/login`

## Route chính

- `/` đăng nhập user (Gmail only)
- `/admin/login` đăng nhập admin
- `/user` trang user (bắt buộc login)
- `/admin/config` cấu hình đấu giá (bắt buộc admin)
- `/admin/auctions` danh sách chi tiết đấu giá
- `/admin/auctions/:id` chi tiết 1 phiên đấu giá

## Logic Lowest Unique Bid

Khi phiên đấu giá hết giờ (server-side):

1. Lấy toàn bộ bids theo `productId`
2. Đếm tần suất từng mức giá
3. Lọc giá có count = 1
4. Sắp xếp tăng dần
5. Lấy `N` giá đầu (`N = winnerCount`)
6. Lưu vào bảng `winners`
7. Cập nhật `product.status = completed`

