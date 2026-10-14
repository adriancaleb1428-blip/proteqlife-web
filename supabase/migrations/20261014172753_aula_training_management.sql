-- Aula Consulting: roles, course sessions, recordings and certificates.
alter table public.meetings add column if not exists meeting_url text;
update public.meetings set meeting_url = room_name where meeting_url is null and room_name like 'http%';

create table if not exists public.course_recordings (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  storage_path text not null unique,
  mime_type text,
  uploaded_by uuid not null references public.profiles(id),
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.course_certificates (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  certificate_number text,
  storage_path text not null unique,
  mime_type text not null default 'application/pdf',
  issued_by uuid not null references public.profiles(id),
  issued_at timestamptz not null default now()
);

create index if not exists course_recordings_course_created_idx on public.course_recordings(course_id, created_at desc);
create index if not exists course_certificates_student_issued_idx on public.course_certificates(student_id, issued_at desc);
create index if not exists course_certificates_course_issued_idx on public.course_certificates(course_id, issued_at desc);

alter table public.course_recordings enable row level security;
alter table public.course_certificates enable row level security;

drop policy if exists course_insert on public.courses;
create policy course_insert on public.courses for insert to authenticated
  with check ((select private.is_admin()) or
    (created_by = (select auth.uid()) and exists(select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'teacher')));

drop policy if exists meetings_read on public.meetings;
create policy meetings_read on public.meetings for select to authenticated
  using ((select private.is_course_member(course_id)) or (select private.can_manage_course(course_id)) or (select private.is_admin()));

drop policy if exists course_recordings_read on public.course_recordings;
create policy course_recordings_read on public.course_recordings for select to authenticated
  using ((is_published and (select private.is_course_member(course_id))) or (select private.can_manage_course(course_id)) or (select private.is_admin()));
drop policy if exists course_recordings_manage on public.course_recordings;
create policy course_recordings_manage on public.course_recordings for all to authenticated
  using ((select private.can_manage_course(course_id)))
  with check ((select private.can_manage_course(course_id)) and uploaded_by = (select auth.uid()));

drop policy if exists course_certificates_read on public.course_certificates;
create policy course_certificates_read on public.course_certificates for select to authenticated
  using (student_id = (select auth.uid()) or (select private.can_manage_course(course_id)) or (select private.is_admin()));
drop policy if exists course_certificates_manage on public.course_certificates;
create policy course_certificates_manage on public.course_certificates for all to authenticated
  using ((select private.can_manage_course(course_id)))
  with check ((select private.can_manage_course(course_id)) and issued_by = (select auth.uid()) and exists(
    select 1 from public.enrollments e where e.course_id = course_certificates.course_id and e.student_id = course_certificates.student_id and e.status = 'active'
  ));

drop policy if exists instructors_read_enrolled_students on public.profiles;
create policy instructors_read_enrolled_students on public.profiles for select to authenticated
  using (role = 'student' and exists (
    select 1 from public.enrollments e where e.student_id = profiles.id and e.status = 'active' and (select private.can_manage_course(e.course_id))
  ));

grant select, insert, update, delete on public.course_recordings, public.course_certificates to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('course-recordings', 'course-recordings', false, 52428800,
  array['video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('course-certificates', 'course-certificates', false, 20971520,
  array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists course_recording_read on storage.objects;
create policy course_recording_read on storage.objects for select to authenticated using (
  bucket_id = 'course-recordings' and exists(select 1 from public.course_recordings r where r.storage_path = name and
    ((r.is_published and (select private.is_course_member(r.course_id))) or (select private.can_manage_course(r.course_id)) or (select private.is_admin())))
);
drop policy if exists course_recording_upload on storage.objects;
create policy course_recording_upload on storage.objects for insert to authenticated with check (
  bucket_id = 'course-recordings' and split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and (select private.can_manage_course(split_part(name, '/', 1)::uuid))
);

drop policy if exists course_certificate_read on storage.objects;
create policy course_certificate_read on storage.objects for select to authenticated using (
  bucket_id = 'course-certificates' and exists(select 1 from public.course_certificates c where c.storage_path = name and
    (c.student_id = (select auth.uid()) or (select private.can_manage_course(c.course_id)) or (select private.is_admin())))
);
drop policy if exists course_certificate_upload on storage.objects;
create policy course_certificate_upload on storage.objects for insert to authenticated with check (
  bucket_id = 'course-certificates' and split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and (select private.can_manage_course(split_part(name, '/', 1)::uuid))
);
