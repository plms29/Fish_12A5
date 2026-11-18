-- Sửa bình luận + chống spam. Chạy sau 20261118000000_comments.sql.
alter table public.comments add column edited_at timestamptz;

create policy "comments_update" on public.comments
  for update to authenticated
  using (public.is_editor()) with check (public.is_editor());

-- Chống spam khi thêm: tối đa 3 bình luận/phút, 30/giờ mỗi tên; không gửi trùng nội dung trong 10 phút.
create or replace function public.comments_before_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.comments c
      where c.author_name = new.author_name and c.created_at > now() - interval '1 minute') >= 3
     or (select count(*) from public.comments c
      where c.author_name = new.author_name and c.created_at > now() - interval '1 hour') >= 30 then
    raise exception 'rate_limit';
  end if;
  if exists (select 1 from public.comments c
      where c.author_name = new.author_name and c.body = new.body
        and c.created_at > now() - interval '10 minutes') then
    raise exception 'duplicate';
  end if;
  return new;
end;
$$;

create trigger comments_spam_guard
before insert on public.comments
for each row execute function public.comments_before_insert();

-- Khi sửa chỉ đổi được nội dung; các cột khác giữ nguyên.
create or replace function public.comments_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.entry_id = old.entry_id;
  new.author_id = old.author_id;
  new.author_name = old.author_name;
  new.created_at = old.created_at;
  new.edited_at = now();
  return new;
end;
$$;

create trigger comments_keep_fields
before update on public.comments
for each row execute function public.comments_before_update();
