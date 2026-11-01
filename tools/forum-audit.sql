select schemaname, tablename from pg_tables where schemaname in ('public','storage') and not rowsecurity;
select schemaname, tablename, policyname, cmd, roles, qual, with_check from pg_policies where 'anon' = any(roles) or 'public' = any(roles) order by 1, 2;
select schemaname, tablename, policyname, cmd from pg_policies where cmd in ('INSERT','UPDATE','DELETE','ALL') and (coalesce(with_check,'') = 'true' or coalesce(qual,'') = 'true');
select n.nspname, p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.prosecdef and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%');
select n.nspname, p.proname, r.rolname from pg_proc p join pg_namespace n on n.oid = p.pronamespace cross join pg_roles r where n.nspname = 'public' and p.prosecdef and r.rolname = 'anon' and has_function_privilege(r.rolname, p.oid, 'execute');
select grantee, table_name, privilege_type from information_schema.role_table_grants where table_schema = 'public' and grantee = 'anon' and privilege_type in ('INSERT','UPDATE','DELETE','TRUNCATE');
select id, public, file_size_limit, allowed_mime_types from storage.buckets where file_size_limit is null or allowed_mime_types is null;
