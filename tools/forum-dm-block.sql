create table if not exists public.dm_blocks (
  blocker uuid not null default auth.uid() references auth.users(id) on delete cascade,
  blocked uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked),
  check (blocker <> blocked)
);
alter table public.dm_blocks enable row level security;
drop policy if exists dm_blocks_sel on public.dm_blocks;
drop policy if exists dm_blocks_ins on public.dm_blocks;
drop policy if exists dm_blocks_del on public.dm_blocks;
create policy dm_blocks_sel on public.dm_blocks for select to authenticated using (blocker = auth.uid());
create policy dm_blocks_ins on public.dm_blocks for insert to authenticated with check (blocker = auth.uid());
create policy dm_blocks_del on public.dm_blocks for delete to authenticated using (blocker = auth.uid());
revoke all on public.dm_blocks from anon, public;
grant select, insert, delete on public.dm_blocks to authenticated;

create table if not exists public.dm_hidden (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  other uuid not null references auth.users(id) on delete cascade,
  cleared_at timestamptz not null default now(),
  primary key (user_id, other)
);
alter table public.dm_hidden enable row level security;
drop policy if exists dm_hidden_sel on public.dm_hidden;
create policy dm_hidden_sel on public.dm_hidden for select to authenticated using (user_id = auth.uid());
revoke all on public.dm_hidden from anon, public;
grant select on public.dm_hidden to authenticated;

create or replace function public.dm_clear(p_other uuid) returns void
language sql security definer set search_path = public, pg_temp as $$
  insert into public.dm_hidden (user_id, other, cleared_at) values (auth.uid(), p_other, now())
  on conflict (user_id, other) do update set cleared_at = now();
$$;
revoke all on function public.dm_clear(uuid) from public, anon;
grant execute on function public.dm_clear(uuid) to authenticated;

create or replace function public.dm_block_guard() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if exists (select 1 from public.dm_blocks where blocker = new.recipient and blocked = new.sender) then
    raise exception 'этот участник не принимает от вас сообщения' using errcode = '42501';
  end if;
  if exists (select 1 from public.dm_blocks where blocker = new.sender and blocked = new.recipient) then
    raise exception 'вы заблокировали этого участника, сначала разблокируйте его' using errcode = '42501';
  end if;
  return new;
end $$;
revoke all on function public.dm_block_guard() from public, anon, authenticated;
drop trigger if exists zz_dm_block_guard on public.dms;
create trigger zz_dm_block_guard before insert on public.dms for each row execute function public.dm_block_guard();

drop policy if exists dms_delete_own on public.dms;
create policy dms_delete_own on public.dms for delete to authenticated using (sender = auth.uid());
grant delete on public.dms to authenticated;
