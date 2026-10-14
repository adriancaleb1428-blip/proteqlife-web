-- Give course instructors explicit, course-scoped management access and allow safe cleanup.
create or replace function private.can_manage_course(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_admin()
    or exists(select 1 from public.course_instructors ci where ci.course_id = target and ci.instructor_id = (select auth.uid()) and ci.can_manage)
    or exists(select 1 from public.courses c where c.id = target and c.created_by = (select auth.uid()))
$$;

drop policy if exists course_delete on public.courses;
create policy course_delete on public.courses for delete to authenticated
  using ((select private.is_admin()) or (created_by = (select auth.uid()) and exists(
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'teacher'
  )));

drop policy if exists course_material_delete on storage.objects;
create policy course_material_delete on storage.objects for delete to authenticated using (
  bucket_id = 'course-materials'
  and split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and (select private.can_manage_course(split_part(name, '/', 1)::uuid))
);

drop policy if exists course_recording_delete on storage.objects;
create policy course_recording_delete on storage.objects for delete to authenticated using (
  bucket_id = 'course-recordings'
  and split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and (select private.can_manage_course(split_part(name, '/', 1)::uuid))
);

drop policy if exists course_certificate_delete on storage.objects;
create policy course_certificate_delete on storage.objects for delete to authenticated using (
  bucket_id = 'course-certificates'
  and split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and (select private.can_manage_course(split_part(name, '/', 1)::uuid))
);
