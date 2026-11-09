# Bể cá 12A5 — Nhật ký nuôi cá

Website nhật ký hành trình nuôi cá của lớp 12A5 (A5K41, THPT Chuyên Lê Quý Đôn).

- **Đọc:** ai có link cũng xem được, không cần tài khoản.
- **Viết:** vào `/viet`, nhập tên + **mã truy cập** của lớp. Không cần email hay mật khẩu.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Supabase: Postgres (bài viết, giai đoạn), Storage (ảnh/video), Auth (một tài khoản viết chung, ẩn phía sau mã truy cập)
- Tiptap: trình soạn thảo chữ + ảnh + video + YouTube
- Deploy: Vercel

## Chạy trên máy

```bash
npm install
npm run dev
```

Mở http://localhost:3000. File `.env` cần các biến trong `.env.example`.

## Deploy lên Vercel

1. Đẩy code lên GitHub (`plms29/Fish_12A5`).
2. Vào vercel.com → **Add New → Project** → chọn repo này → Framework: Next.js.
3. Mục **Environment Variables**, thêm:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (giữ bí mật)
   - `NEXT_PUBLIC_SITE_URL` = địa chỉ web sau khi deploy, ví dụ `https://fish-12a5.vercel.app`
4. Bấm **Deploy**. Từ đó mỗi lần push lên `main`, Vercel tự cập nhật web.

## Database

Các file SQL trong `supabase/migrations/` đã được chạy trên project Supabase.
Mã truy cập mặc định là `asymptotic-12a5`. **Hãy đổi ngay** trong `/viet/cai-dat`.

## Giới hạn gói miễn phí Supabase

- Tổng dung lượng Storage 1 GB; mỗi tệp tối đa 50 MB.
- Ảnh được tự nén về WebP (cạnh dài tối đa 2000px) trước khi tải lên.
- Video dài nên tải lên YouTube (chế độ không công khai) rồi dùng nút **+ YouTube**.
