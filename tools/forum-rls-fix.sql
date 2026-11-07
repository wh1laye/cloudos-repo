begin;

revoke update on public.profiles from anon, authenticated;
revoke update on public.posts, public.threads from anon;

create or replace function public.posts_guard() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_adm() then
    if new.thread_id is distinct from old.thread_id
       or new.author is distinct from old.author
       or new.parent_id is distinct from old.parent_id
       or new.created_at is distinct from old.created_at
       or new.id is distinct from old.id then
      raise exception 'это поле сообщения менять нельзя' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;
revoke all on function public.posts_guard() from public, anon, authenticated;
drop trigger if exists zz_posts_guard on public.posts;
create trigger zz_posts_guard before update on public.posts for each row execute function public.posts_guard();

create or replace function public.threads_guard() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_adm() then
    if new.locked is distinct from old.locked
       or new.pinned is distinct from old.pinned
       or new.solved is distinct from old.solved
       or new.board_id is distinct from old.board_id
       or new.author is distinct from old.author
       or new.created_at is distinct from old.created_at
       or new.id is distinct from old.id then
      raise exception 'это поле темы менять нельзя' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;
revoke all on function public.threads_guard() from public, anon, authenticated;
drop trigger if exists zz_threads_guard on public.threads;
create trigger zz_threads_guard before update on public.threads for each row execute function public.threads_guard();

commit;
