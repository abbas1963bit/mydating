create extension if not exists pgcrypto with schema extensions;

create type public.user_role as enum ('member', 'moderator', 'admin');
create type public.profile_visibility as enum ('public', 'members', 'private');
create type public.photo_visibility as enum ('public', 'members', 'private');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 60),
  age smallint check (age between 18 and 120),
  gender text check (gender is null or char_length(gender) <= 40),
  country text check (country is null or char_length(country) <= 100),
  city text check (city is null or char_length(city) <= 100),
  locale text not null default 'en',
  marital_status text check (marital_status is null or char_length(marital_status) <= 40),
  occupation text check (occupation is null or char_length(occupation) <= 100),
  education text check (education is null or char_length(education) <= 100),
  interests text[] not null default '{}',
  bio text not null default '' check (char_length(bio) <= 1200),
  looking_for text not null default '' check (char_length(looking_for) <= 800),
  preferred_min_age smallint check (preferred_min_age between 18 and 120),
  preferred_max_age smallint check (preferred_max_age between 18 and 120),
  preferred_country text check (preferred_country is null or char_length(preferred_country) <= 100),
  preferred_city text check (preferred_city is null or char_length(preferred_city) <= 100),
  preferred_language text,
  preferred_interests text[] not null default '{}',
  avatar_path text,
  visibility public.profile_visibility not null default 'members',
  show_age boolean not null default true,
  show_city boolean not null default true,
  is_active boolean not null default true,
  is_verified boolean not null default false,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (preferred_min_age is null or preferred_max_age is null or preferred_min_age <= preferred_max_age)
);

create table public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  object_path text not null unique,
  is_primary boolean not null default false,
  visibility public.photo_visibility not null default 'members',
  created_at timestamptz not null default now()
);

create unique index profile_photos_one_primary on public.profile_photos (user_id) where is_primary;

create table public.likes (
  from_user_id uuid not null references public.profiles (id) on delete cascade,
  to_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (from_user_id, to_user_id),
  check (from_user_id <> to_user_id)
);

create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.profile_visits (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references public.profiles (id) on delete cascade,
  visited_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (visitor_id <> visited_id)
);

create index profile_visits_visited_created on public.profile_visits (visited_id, created_at desc);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  member_one uuid not null references public.profiles (id) on delete cascade,
  member_two uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  unique (member_one, member_two),
  check (member_one < member_two)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index messages_conversation_created on public.messages (conversation_id, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  kind text not null check (kind in ('like', 'message', 'visit', 'report_update')),
  reference_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_created on public.notifications (user_id, created_at desc);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (reason in ('fake_profile', 'harassment', 'spam', 'underage', 'inappropriate_content', 'other')),
  details text not null default '' check (char_length(details) <= 1500),
  status public.report_status not null default 'open',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_id)
);

create index reports_status_created on public.reports (status, created_at desc);

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('admin', 'moderator') and is_active
  );
$$;

create or replace function public.has_block_between(first_user uuid, second_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = first_user and blocked_id = second_user)
       or (blocker_id = second_user and blocked_id = first_user)
  );
$$;

create or replace function public.can_view_profile(profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = profile_id
      and (p.is_active or p.id = (select auth.uid()) or public.is_staff())
      and (p.age >= 18 or p.id = (select auth.uid()) or public.is_staff())
      and (p.id = (select auth.uid()) or public.is_staff() or p.visibility = 'public' or p.visibility = 'members')
      and (p.id = (select auth.uid()) or not public.has_block_between((select auth.uid()), p.id))
  );
$$;

revoke all on function public.is_staff() from public, anon;
revoke all on function public.has_block_between(uuid, uuid) from public, anon;
revoke all on function public.can_view_profile(uuid) from public, anon;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.has_block_between(uuid, uuid) to authenticated;
grant execute on function public.can_view_profile(uuid) to authenticated;

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is not null and current_setting('app.allow_account_state_change', true) is distinct from 'on' then
    if auth.uid() = old.id or not exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin' and p.is_active
    ) then
      new.role := old.role;
      new.is_verified := old.is_verified;
      new.is_active := old.is_active;
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger protect_profile_privileges
before update on public.profiles
for each row execute function public.protect_profile_fields();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  submitted_name text;
  submitted_age smallint;
begin
  submitted_name := coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1));
  if new.raw_user_meta_data ->> 'age' ~ '^[0-9]{2,3}$' then
    submitted_age := (new.raw_user_meta_data ->> 'age')::smallint;
  end if;
  insert into public.profiles (id, display_name, age, is_verified)
  values (new.id, left(submitted_name, 60), submitted_age, new.email_confirmed_at is not null);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create or replace function public.sync_profile_email_verification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is distinct from old.email_confirmed_at then
    perform set_config('app.allow_account_state_change', 'on', true);
    update public.profiles set is_verified = new.email_confirmed_at is not null where id = new.id;
    perform set_config('app.allow_account_state_change', 'off', true);
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_confirmed
after update of email_confirmed_at on auth.users
for each row execute function public.sync_profile_email_verification();

create or replace function public.delete_profile_storage()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from storage.objects
  where bucket_id = 'profile-photos' and (storage.foldername(name))[1] = old.id::text;
  return old;
end;
$$;

create trigger on_profile_deleted
before delete on public.profiles
for each row execute function public.delete_profile_storage();

create or replace function public.start_conversation(other_user uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  first_user uuid;
  second_user uuid;
  conversation_id uuid;
begin
  if current_user_id is null or current_user_id = other_user then
    raise exception 'Invalid participant';
  end if;
  if not public.can_view_profile(other_user) or public.has_block_between(current_user_id, other_user) then
    raise exception 'Conversation unavailable';
  end if;
  first_user := least(current_user_id, other_user);
  second_user := greatest(current_user_id, other_user);
  insert into public.conversations (member_one, member_two)
  values (first_user, second_user)
  on conflict (member_one, member_two) do update set last_message_at = public.conversations.last_message_at
  returning id into conversation_id;
  return conversation_id;
end;
$$;

revoke all on function public.start_conversation(uuid) from public, anon;
grant execute on function public.start_conversation(uuid) to authenticated;

create or replace function public.prepare_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  conversation public.conversations;
  recipient uuid;
begin
  select * into conversation from public.conversations where id = new.conversation_id;
  if auth.uid() is null or new.sender_id <> auth.uid()
     or auth.uid() not in (conversation.member_one, conversation.member_two)
     or public.has_block_between(conversation.member_one, conversation.member_two) then
    raise exception 'Message not allowed';
  end if;
  new.delivered_at := now();
  if conversation.member_one = new.sender_id then recipient := conversation.member_two;
  else recipient := conversation.member_one;
  end if;
  update public.conversations set last_message_at = now() where id = new.conversation_id;
  insert into public.notifications (user_id, actor_id, kind, reference_id)
  values (recipient, new.sender_id, 'message', new.conversation_id);
  return new;
end;
$$;

create trigger prepare_message_before_insert
before insert on public.messages
for each row execute function public.prepare_message();

create or replace function public.protect_message_content()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.conversation_id <> old.conversation_id or new.sender_id <> old.sender_id or new.body <> old.body or new.created_at <> old.created_at or new.delivered_at is distinct from old.delivered_at then
    raise exception 'Message content is immutable';
  end if;
  return new;
end;
$$;

create trigger protect_message_content_before_update
before update on public.messages
for each row execute function public.protect_message_content();

create or replace function public.protect_notification_content()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id <> old.user_id or new.actor_id is distinct from old.actor_id or new.kind <> old.kind or new.reference_id is distinct from old.reference_id or new.created_at <> old.created_at then
    raise exception 'Notification content is immutable';
  end if;
  return new;
end;
$$;

create trigger protect_notification_content_before_update
before update on public.notifications
for each row execute function public.protect_notification_content();

create or replace function public.notify_like()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (user_id, actor_id, kind, reference_id)
  values (new.to_user_id, new.from_user_id, 'like', new.from_user_id);
  return new;
end;
$$;

create trigger notify_like_after_insert after insert on public.likes
for each row execute function public.notify_like();

create or replace function public.notify_profile_visit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (user_id, actor_id, kind, reference_id)
  values (new.visited_id, new.visitor_id, 'visit', new.id);
  return new;
end;
$$;

create trigger notify_profile_visit_after_insert after insert on public.profile_visits
for each row execute function public.notify_profile_visit();

create or replace function public.mark_message_read(message_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.messages m
  set read_at = coalesce(m.read_at, now())
  from public.conversations c
  where m.id = message_id
    and c.id = m.conversation_id
    and (c.member_one = auth.uid() or c.member_two = auth.uid())
    and m.sender_id <> auth.uid();
end;
$$;

revoke all on function public.mark_message_read(uuid) from public, anon;
grant execute on function public.mark_message_read(uuid) to authenticated;

create or replace function public.mark_conversation_read(target_conversation uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.messages m
  set read_at = coalesce(m.read_at, now())
  from public.conversations c
  where c.id = target_conversation
    and c.id = m.conversation_id
    and (c.member_one = auth.uid() or c.member_two = auth.uid())
    and m.sender_id <> auth.uid();
end;
$$;

revoke all on function public.mark_conversation_read(uuid) from public, anon;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

create or replace function public.deactivate_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  perform set_config('app.allow_account_state_change', 'on', true);
  update public.profiles set is_active = false where id = auth.uid();
  perform set_config('app.allow_account_state_change', 'off', true);
end;
$$;

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  delete from storage.objects
  where bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.deactivate_own_account() from public, anon;
revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.deactivate_own_account() to authenticated;
grant execute on function public.delete_own_account() to authenticated;

alter table public.profiles enable row level security;
alter table public.profile_photos enable row level security;
alter table public.likes enable row level security;
alter table public.blocks enable row level security;
alter table public.profile_visits enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

create policy "Profiles are visible by privacy settings"
on public.profiles for select to authenticated
using (public.can_view_profile(id));
create policy "Members create their own profile"
on public.profiles for insert to authenticated
with check (id = (select auth.uid()));
create policy "Members update their own profile"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));
create policy "Staff manage profiles"
on public.profiles for update to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Photos follow owner profile privacy"
on public.profile_photos for select to authenticated
using ((user_id = (select auth.uid()) or public.can_view_profile(user_id))
  and (visibility <> 'private' or user_id = (select auth.uid())));
create policy "Members add their own photos"
on public.profile_photos for insert to authenticated
with check (user_id = (select auth.uid()));
create policy "Members manage their own photos"
on public.profile_photos for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
create policy "Members delete their own photos"
on public.profile_photos for delete to authenticated
using (user_id = (select auth.uid()));

create policy "Members see their likes"
on public.likes for select to authenticated
using (from_user_id = (select auth.uid()) or to_user_id = (select auth.uid()));
create policy "Members send a like"
on public.likes for insert to authenticated
with check (from_user_id = (select auth.uid()) and public.can_view_profile(to_user_id) and not public.has_block_between(from_user_id, to_user_id));
create policy "Members remove their own like"
on public.likes for delete to authenticated
using (from_user_id = (select auth.uid()));

create policy "Members see their blocks"
on public.blocks for select to authenticated
using (blocker_id = (select auth.uid()));
create policy "Members block another profile"
on public.blocks for insert to authenticated
with check (blocker_id = (select auth.uid()));
create policy "Members unblock a profile"
on public.blocks for delete to authenticated
using (blocker_id = (select auth.uid()));

create policy "Members see profile visits involving them"
on public.profile_visits for select to authenticated
using (visitor_id = (select auth.uid()) or visited_id = (select auth.uid()));
create policy "Members record a visit"
on public.profile_visits for insert to authenticated
with check (visitor_id = (select auth.uid()) and visitor_id <> visited_id and public.can_view_profile(visited_id));

create policy "Conversation members can read conversations"
on public.conversations for select to authenticated
using ((member_one = (select auth.uid()) or member_two = (select auth.uid())) and not public.has_block_between(member_one, member_two));
create policy "Conversation members can read messages"
on public.messages for select to authenticated
using (exists (
  select 1 from public.conversations c
  where c.id = conversation_id
    and (c.member_one = (select auth.uid()) or c.member_two = (select auth.uid()))
    and not public.has_block_between(c.member_one, c.member_two)
));
create policy "Conversation members send text messages"
on public.messages for insert to authenticated
with check (sender_id = (select auth.uid()) and exists (
  select 1 from public.conversations c
  where c.id = conversation_id
    and (c.member_one = (select auth.uid()) or c.member_two = (select auth.uid()))
    and not public.has_block_between(c.member_one, c.member_two)
));
create policy "Recipients mark messages read"
on public.messages for update to authenticated
using (sender_id <> (select auth.uid()) and exists (
  select 1 from public.conversations c
  where c.id = conversation_id and (c.member_one = (select auth.uid()) or c.member_two = (select auth.uid()))
))
with check (sender_id <> (select auth.uid()));

create policy "Members read their notifications"
on public.notifications for select to authenticated
using (user_id = (select auth.uid()));
create policy "Members mark their notifications read"
on public.notifications for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Members create reports"
on public.reports for insert to authenticated
with check (reporter_id = (select auth.uid()) and reported_id <> (select auth.uid()));
create policy "Members see their reports"
on public.reports for select to authenticated
using (reporter_id = (select auth.uid()) or public.is_staff());
create policy "Staff review reports"
on public.reports for update to authenticated
using (public.is_staff())
with check (public.is_staff());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Members read photos they can see"
on storage.objects for select to authenticated
using (
  bucket_id = 'profile-photos'
  and exists (
    select 1 from public.profile_photos p
    where p.object_path = name
      and (p.user_id = (select auth.uid()) or (public.can_view_profile(p.user_id) and p.visibility <> 'private'))
  )
);
create policy "Members upload their own photos"
on storage.objects for insert to authenticated
with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Members update their own photo objects"
on storage.objects for update to authenticated
using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Members delete their own photo objects"
on storage.objects for delete to authenticated
using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);