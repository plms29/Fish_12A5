-- Storage cần quyền SELECT để biên tập viên xoá/ghi đè được tệp trong bucket "media".
create policy "media_bucket_editor_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and public.is_editor());
