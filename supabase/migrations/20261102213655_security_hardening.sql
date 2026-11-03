-- Browser clients cannot read or write the email delivery ledger.
revoke all on table public.notification_email_deliveries from public, anon, authenticated;
drop policy if exists notification_email_deliveries_service_only on public.notification_email_deliveries;
create policy notification_email_deliveries_service_only
on public.notification_email_deliveries for all to service_role
using (true) with check (true);

-- Prevent unencrypted or unsafe external meeting destinations.
alter table public.meetings drop constraint if exists meetings_https_url;
alter table public.meetings add constraint meetings_https_url
  check (meeting_url is null or meeting_url ~* '^https://[^[:space:]]+$');

create table if not exists private.security_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (event_type ~ '^[a-z0-9_.-]{1,80}$'),
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists security_events_occurred_at_idx on private.security_events (occurred_at desc);
create index if not exists security_events_actor_id_idx on private.security_events (actor_id, occurred_at desc);
revoke all on table private.security_events from public, anon, authenticated;

create or replace function public.log_security_event(p_event_type text, p_actor_id uuid, p_metadata jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_event_type !~ '^[a-z0-9_.-]{1,80}$' then raise exception 'invalid event type'; end if;
  insert into private.security_events (actor_id, event_type, metadata)
  values (p_actor_id, p_event_type, coalesce(p_metadata, '{}'::jsonb));
end;
$$;
revoke all on function public.log_security_event(text, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.log_security_event(text, uuid, jsonb) to service_role;

create table if not exists private.edge_rate_limits (
  actor_id uuid not null,
  action text not null check (action ~ '^[a-z0-9_.-]{1,80}$'),
  occurred_at timestamptz not null default now()
);
create index if not exists edge_rate_limits_actor_action_time_idx on private.edge_rate_limits (actor_id, action, occurred_at desc);
revoke all on table private.edge_rate_limits from public, anon, authenticated;

create or replace function public.consume_edge_rate_limit(p_actor_id uuid, p_action text, p_limit integer, p_window_seconds integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare used_count integer;
begin
  if p_actor_id is null or p_action !~ '^[a-z0-9_.-]{1,80}$' or p_limit < 1 or p_limit > 1000 or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'invalid rate limit request';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_actor_id::text || ':' || p_action, 0));
  delete from private.edge_rate_limits where occurred_at < now() - make_interval(secs => p_window_seconds);
  select count(*) into used_count from private.edge_rate_limits
  where actor_id = p_actor_id and action = p_action and occurred_at >= now() - make_interval(secs => p_window_seconds);
  if used_count >= p_limit then return false; end if;
  insert into private.edge_rate_limits (actor_id, action) values (p_actor_id, p_action);
  return true;
end;
$$;
revoke all on function public.consume_edge_rate_limit(uuid, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_edge_rate_limit(uuid, text, integer, integer) to service_role;
