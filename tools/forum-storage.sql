begin;

alter policy av_read on storage.objects to authenticated;
alter policy bdg_read on storage.objects to authenticated;
alter policy posts_read on storage.objects to authenticated;

commit;
