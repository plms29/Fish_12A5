-- Bình luận dưới bài nhật ký: ai cũng đọc (bài đã đăng), chỉ người đã đăng nhập mới viết.
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 60),
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index comments_entry_idx on public.comments (entry_id, created_at);

alter table public.comments enable row level security;

create policy "comments_read" on public.comments
  for select using (
    public.is_editor()
    or exists (
      select 1 from public.entries e
      where e.id = comments.entry_id and e.status = 'published'
    )
  );

-- Mọi người vào bằng mã lớp đều là biên tập viên (tài khoản dùng chung).
create policy "comments_insert" on public.comments
  for insert to authenticated
  with check (public.is_editor() and author_id = auth.uid());

create policy "comments_delete" on public.comments
  for delete to authenticated using (public.is_editor());
