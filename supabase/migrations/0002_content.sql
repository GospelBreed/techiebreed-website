-- ============================================================================
-- TechieBreed website admin — migration 0002: drafts and reviews
--
-- Unpublished work lives here; publishing writes it to GitHub (the live site).
-- One open draft per person per item. Editors submit drafts for review;
-- Admins approve (publish) or send them back with a note.
--
-- How to run: Supabase → SQL Editor → New query → paste this whole file → Run.
-- Run AFTER 0001_admin.sql. Safe to run more than once.
-- ============================================================================

create table if not exists public.site_content_drafts (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('article', 'case_study')),
  slug          text,                       -- the live item it edits; null for something new
  base_sha      text,                       -- version of the live file the draft started from
  title         text not null default '',
  data          jsonb not null default '{}'::jsonb,   -- fields (summary, tags, client, flow …)
  body          text not null default '',
  owner_id      uuid references public.site_staff (id) on delete set null,
  owner_name    text not null,
  status        text not null default 'draft' check (status in ('draft', 'in_review', 'changes_requested')),
  review_note   text,
  submitted_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  updated_by    uuid references public.site_staff (id) on delete set null
);

create index if not exists site_content_drafts_kind on public.site_content_drafts (kind, updated_at desc);
create index if not exists site_content_drafts_status on public.site_content_drafts (status);
create index if not exists site_content_drafts_owner on public.site_content_drafts (owner_id);

drop trigger if exists site_content_drafts_touch on public.site_content_drafts;
create trigger site_content_drafts_touch before update on public.site_content_drafts
  for each row execute function public.site_touch_updated_at();

alter table public.site_content_drafts enable row level security;
revoke all on public.site_content_drafts from anon, authenticated;
