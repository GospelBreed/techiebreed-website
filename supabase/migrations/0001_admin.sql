-- ============================================================================
-- TechieBreed website admin — migration 0001
--
-- Staff accounts and roles, sign-in attempt tracking (lockout), the activity
-- log and the enquiries inbox.
--
-- How to run: Supabase → SQL Editor → New query → paste this whole file → Run.
-- Safe to run more than once (idempotent).
--
-- Security model: every table has Row Level Security ON with NO policies, so
-- the public (anon) and signed-in (authenticated) API keys can't read or write
-- anything. Only the website's server, using the service-role key, can.
-- All tables use the site_ prefix so they never clash with other apps.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Staff: one row per person who can sign in to /admin.
-- ---------------------------------------------------------------------------
create table if not exists public.site_staff (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null unique,
  full_name     text not null default '',
  role          text not null check (role in ('super_admin', 'admin', 'editor', 'author', 'support')),
  status        text not null default 'invited' check (status in ('invited', 'active', 'suspended')),
  require_mfa   boolean not null default false,
  invited_by    uuid references public.site_staff (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  last_sign_in  timestamptz
);

-- Exactly one Super Admin at most.
create unique index if not exists site_staff_one_super_admin
  on public.site_staff ((role)) where role = 'super_admin';

-- ---------------------------------------------------------------------------
-- Sign-in attempts: used to lock an email for 15 minutes after 5 failures.
-- ---------------------------------------------------------------------------
create table if not exists public.site_login_attempts (
  id         bigint generated always as identity primary key,
  email      text not null,
  ip         text,
  success    boolean not null,
  at         timestamptz not null default now()
);
create index if not exists site_login_attempts_email_at on public.site_login_attempts (lower(email), at desc);

-- ---------------------------------------------------------------------------
-- Activity log: every change made in the admin (and by whom).
-- ---------------------------------------------------------------------------
create table if not exists public.site_activity (
  id           bigint generated always as identity primary key,
  at           timestamptz not null default now(),
  actor_id     uuid references public.site_staff (id) on delete set null,
  actor_name   text not null,
  action       text not null,            -- e.g. article.publish, staff.invite
  target_type  text,                     -- article | case_study | settings | staff | enquiry
  target_id    text,
  summary      text not null,
  commit_sha   text,                     -- GitHub commit, when the change was published
  details      jsonb not null default '{}'::jsonb
);
create index if not exists site_activity_at on public.site_activity (at desc);

-- ---------------------------------------------------------------------------
-- Enquiries: every Contact / Academy form submission.
-- ---------------------------------------------------------------------------
create table if not exists public.site_enquiries (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  kind         text not null check (kind in ('discovery', 'academy')),
  name         text not null,
  email        text not null,
  company      text,
  interest     text,
  payload      jsonb not null default '{}'::jsonb,   -- every answer from the form
  status       text not null default 'new' check (status in ('new', 'replied', 'closed', 'spam')),
  assigned_to  uuid references public.site_staff (id) on delete set null,
  updated_at   timestamptz not null default now()
);
create index if not exists site_enquiries_created on public.site_enquiries (created_at desc);
create index if not exists site_enquiries_status on public.site_enquiries (status);

create table if not exists public.site_enquiry_notes (
  id          bigint generated always as identity primary key,
  enquiry_id  uuid not null references public.site_enquiries (id) on delete cascade,
  author_id   uuid references public.site_staff (id) on delete set null,
  author_name text not null,
  body        text not null,
  at          timestamptz not null default now()
);
create index if not exists site_enquiry_notes_enquiry on public.site_enquiry_notes (enquiry_id, at);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.site_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists site_staff_touch on public.site_staff;
create trigger site_staff_touch before update on public.site_staff
  for each row execute function public.site_touch_updated_at();

drop trigger if exists site_enquiries_touch on public.site_enquiries;
create trigger site_enquiries_touch before update on public.site_enquiries
  for each row execute function public.site_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Lock everything down: RLS on, no policies, no grants to public API roles.
-- ---------------------------------------------------------------------------
alter table public.site_staff          enable row level security;
alter table public.site_login_attempts enable row level security;
alter table public.site_activity       enable row level security;
alter table public.site_enquiries      enable row level security;
alter table public.site_enquiry_notes  enable row level security;

revoke all on public.site_staff, public.site_login_attempts, public.site_activity,
              public.site_enquiries, public.site_enquiry_notes
  from anon, authenticated;

revoke execute on function public.site_touch_updated_at() from public, anon, authenticated;

-- Done. Next: in Supabase → Authentication → Sign In / Providers → Email,
-- turn OFF "Allow new users to sign up" (only the Super Admin can invite).
