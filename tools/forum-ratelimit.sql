begin;

create table if not exists public.rl_log (
  u uuid not null,
  k text not null,
  at timestamptz not null default now()
);
create index if not exists rl_log_u_k_at on public.rl_log (u, k, at desc);
create index if not exists rl_log_at on public.rl_log (at);
alter table public.rl_log enable row level security;
revoke all on public.rl_log from anon, authenticated, public;

create or replace function public.rl_guard() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  me uuid := auth.uid();
  key text := tg_argv[0];
  young boolean;
  i int := 1;
  w int;
  mx int;
  cnt int;
begin
  if me is null or public.is_adm() then
    return new;
  end if;
  select u.created_at > now() - interval '1 day' into young from auth.users u where u.id = me;
  young := coalesce(young, true);
  while i + 2 < tg_nargs loop
    w := tg_argv[i]::int;
    mx := case when young then tg_argv[i + 2]::int else tg_argv[i + 1]::int end;
    select count(*) into cnt from public.rl_log l where l.u = me and l.k = key and l.at > now() - make_interval(secs => w);
    if cnt >= mx then
      raise exception 'слишком часто, подожди немного' using errcode = 'PT429';
    end if;
    i := i + 3;
  end loop;
  insert into public.rl_log (u, k) values (me, key);
  if random() < 0.01 then
    delete from public.rl_log l where l.at < now() - interval '1 day';
  end if;
  return new;
end $$;
revoke all on function public.rl_guard() from public, anon, authenticated;

drop trigger if exists zz_rl_posts on public.posts;
create trigger zz_rl_posts before insert on public.posts for each row execute function public.rl_guard('posts', '60', '5', '2', '3600', '60', '20');

drop trigger if exists zz_rl_threads on public.threads;
create trigger zz_rl_threads before insert on public.threads for each row execute function public.rl_guard('threads', '300', '2', '1', '3600', '10', '3');

drop trigger if exists zz_rl_dms on public.dms;
create trigger zz_rl_dms before insert on public.dms for each row execute function public.rl_guard('dms', '60', '10', '4', '3600', '100', '30');

drop trigger if exists zz_rl_reactions on public.reactions;
create trigger zz_rl_reactions before insert on public.reactions for each row execute function public.rl_guard('reactions', '60', '20', '10', '3600', '300', '100');

drop trigger if exists zz_rl_reports on public.reports;
create trigger zz_rl_reports before insert on public.reports for each row execute function public.rl_guard('reports', '300', '3', '2', '3600', '10', '5');

commit;
