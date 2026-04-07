create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "Contact messages insert public" on public.contact_messages;
create policy "Contact messages insert public"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

drop policy if exists "Contact messages read authenticated" on public.contact_messages;
create policy "Contact messages read authenticated"
on public.contact_messages
for select
to authenticated
using (true);
