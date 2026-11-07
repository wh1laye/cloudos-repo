begin;

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke truncate, references, trigger on all tables in schema public from authenticated;

grant select on public.badges, public.boards, public.helpful, public.likes, public.post_edits, public.posts, public.profile_comments, public.profiles, public.reactions, public.roles, public.site_settings, public.threads, public.user_badges to anon;

alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke truncate, references, trigger on tables from authenticated;

do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as sig, p.prorettype in ('trigger'::regtype, 'event_trigger'::regtype) as is_trg
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and (p.prorettype in ('trigger'::regtype, 'event_trigger'::regtype)
           or p.proname in ('admin_reset_profile', 'award_all', 'award_me', 'award_user', 'create_poll', 'edit_post',
                            'poll_vote', 'rp_mod', 'set_badge_rule', 'set_board_access', 'set_name', 'set_role',
                            'set_tags', 'set_ui', 'update_my_profile'))
  loop
    execute format('revoke execute on function %s from public, anon', r.sig);
    if not r.is_trg then
      execute format('grant execute on function %s to authenticated', r.sig);
    end if;
  end loop;
end $$;

commit;
