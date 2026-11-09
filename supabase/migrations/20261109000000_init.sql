-- =========================================================
-- Nhật ký nuôi cá 12A5 — schema khởi tạo
-- Đọc: công khai (chỉ bài đã đăng). Viết: chỉ biên tập viên.
-- =========================================================

-- ---------- Hồ sơ người viết ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  is_editor boolean not null default false,
  created_at timestamptz not null default now()
);

-- Hàm kiểm tra quyền biên tập (security definer để dùng trong RLS)
create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.is_editor from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- ---------- Cài đặt riêng tư (mã mời) ----------
create table public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- ---------- Giai đoạn của bể ----------
create table public.phases (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  description text not null default '',
  start_date date,
  end_date date,
  cover_path text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Bài nhật ký ----------
create table public.entries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null check (char_length(title) between 1 and 200),
  excerpt text not null default '',
  content_json jsonb not null default '{}'::jsonb,
  content_html text not null default '',
  entry_date date not null default (now() at time zone 'Asia/Ho_Chi_Minh')::date,
  phase_id uuid references public.phases (id) on delete set null,
  tags text[] not null default '{}',
  cover_path text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  author_id uuid references public.profiles (id) on delete set null,
  author_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index entries_published_idx on public.entries (status, entry_date desc);
create index entries_phase_idx on public.entries (phase_id);

-- ---------- Ảnh / video ----------
create table public.media (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid references public.entries (id) on delete cascade,
  kind text not null check (kind in ('image', 'video')),
  path text not null,
  width int,
  height int,
  caption text not null default '',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index media_entry_idx on public.media (entry_id);

-- ---------- updated_at tự động ----------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger entries_touch
before update on public.entries
for each row execute function public.touch_updated_at();

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.phases enable row level security;
alter table public.entries enable row level security;
alter table public.media enable row level security;

-- profiles: ai cũng xem tên tác giả; tự sửa tên của mình nhưng không tự cấp quyền
create policy "profiles_read" on public.profiles
  for select using (true);

create policy "profiles_update_self" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and is_editor = (select p.is_editor from public.profiles p where p.id = auth.uid()));

-- app_settings: chỉ biên tập viên đọc/sửa
create policy "settings_editor_read" on public.app_settings
  for select to authenticated using (public.is_editor());

create policy "settings_editor_write" on public.app_settings
  for update to authenticated
  using (public.is_editor()) with check (public.is_editor());

-- phases: ai cũng đọc, biên tập viên viết
create policy "phases_read" on public.phases
  for select using (true);

create policy "phases_editor_insert" on public.phases
  for insert to authenticated with check (public.is_editor());

create policy "phases_editor_update" on public.phases
  for update to authenticated
  using (public.is_editor()) with check (public.is_editor());

create policy "phases_editor_delete" on public.phases
  for delete to authenticated using (public.is_editor());

-- entries: công khai chỉ bài đã đăng; biên tập viên thấy cả nháp
create policy "entries_read" on public.entries
  for select using (status = 'published' or public.is_editor());

create policy "entries_editor_insert" on public.entries
  for insert to authenticated with check (public.is_editor());

create policy "entries_editor_update" on public.entries
  for update to authenticated
  using (public.is_editor()) with check (public.is_editor());

create policy "entries_editor_delete" on public.entries
  for delete to authenticated using (public.is_editor());

-- media: công khai nếu thuộc bài đã đăng
create policy "media_read" on public.media
  for select using (
    public.is_editor()
    or exists (
      select 1 from public.entries e
      where e.id = media.entry_id and e.status = 'published'
    )
  );

create policy "media_editor_insert" on public.media
  for insert to authenticated with check (public.is_editor());

create policy "media_editor_update" on public.media
  for update to authenticated
  using (public.is_editor()) with check (public.is_editor());

create policy "media_editor_delete" on public.media
  for delete to authenticated using (public.is_editor());

-- =========================================================
-- Storage: bucket "media" (đọc công khai, chỉ biên tập viên tải lên)
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  52428800, -- 50 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do nothing;

create policy "media_bucket_editor_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_editor());

create policy "media_bucket_editor_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_editor());

create policy "media_bucket_editor_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_editor());

-- =========================================================
-- Dữ liệu ban đầu
-- =========================================================
insert into public.phases (slug, title, description, start_date, end_date, sort_order)
values
  ('ca-betta', 'Cá betta',
   'Những ngày đầu tiên: một chú cá betta làm cư dân duy nhất của bể lớp. Sáng 09/11/2026, bé betta chuyển sang một nơi ở mới.',
   null, '2026-11-09', 1),
  ('dan-ca-nhieu-mau', 'Đàn cá nhiều màu',
   'Từ 09/11/2026, bể đón một đàn cá nhiều màu sắc.',
   '2026-11-09', null, 2);

-- Mã mời mặc định — hãy đổi ngay trong trang /viet/cai-dat
insert into public.app_settings (key, value) values ('invite_code', 'asymptotic-12a5');
