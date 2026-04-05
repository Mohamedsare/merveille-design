-- Merveill design — schéma production-ready
-- Exécuter dans Supabase SQL Editor ou via CLI

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Admin (lié à auth.users)
-- ---------------------------------------------------------------------------
create table public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Paramètres site
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'Merveill design',
  logo_url text,
  favicon_url text,
  hero_title text,
  hero_subtitle text,
  whatsapp_number text,
  contact_email text,
  social_links jsonb default '{}'::jsonb,
  theme_config jsonb default '{}'::jsonb,
  seo_title text,
  seo_description text,
  seo_keywords text,
  updated_at timestamptz not null default now()
);

-- Ligne unique paramètres : insérer via seed.sql ou dashboard après déploiement

-- ---------------------------------------------------------------------------
-- Catégories
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type text not null check (type in ('bag', 'box', 'training')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Produits (sacs & box)
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references public.categories (id) on delete set null,
  type text not null check (type in ('bag', 'box')),
  short_description text,
  description text,
  base_price numeric(12,2),
  pricing_mode text not null default 'quote' check (pricing_mode in ('fixed', 'quote', 'starting_from')),
  is_customizable boolean not null default true,
  is_model_only boolean not null default false,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  cover_image_url text,
  tags text[] default array[]::text[],
  display_order int not null default 0,
  stock int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_url text not null,
  original_image_url text,
  enhanced_image_url text,
  enhancement_status text not null default 'none'
    check (enhancement_status in ('none', 'pending', 'processing', 'enhanced', 'approved', 'rejected', 'error')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Formations
-- ---------------------------------------------------------------------------
create table public.trainings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  price numeric(12,2),
  pricing_mode text not null default 'quote' check (pricing_mode in ('fixed', 'quote', 'starting_from')),
  duration text,
  level text,
  mode text default 'presentiel',
  is_published boolean not null default false,
  cover_image_url text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Commandes & réservations
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text,
  city text,
  country text default 'Burkina Faso',
  order_type text not null check (order_type in ('bag', 'box', 'custom_bag', 'training')),
  product_id uuid references public.products (id) on delete set null,
  training_id uuid references public.trainings (id) on delete set null,
  quantity int not null default 1,
  budget text,
  customization_request text,
  details text,
  fabric_color_notes text,
  inspiration_image_url text,
  preferred_date date,
  status text not null default 'new',
  admin_notes text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  from_status text,
  to_status text not null,
  note text,
  created_by uuid references public.admin_users (id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Événements analytics (complément PostHog)
-- ---------------------------------------------------------------------------
create table public.visitor_events (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  event_name text not null,
  page_path text,
  device_type text,
  browser text,
  country text,
  city text,
  referrer text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Index
-- ---------------------------------------------------------------------------
create index idx_products_published on public.products (is_published, display_order);
create index idx_products_category on public.products (category_id);
create index idx_orders_status on public.orders (status, created_at desc);
create index idx_orders_type on public.orders (order_type);
create index idx_visitor_events_created on public.visitor_events (created_at desc);
create index idx_visitor_events_name on public.visitor_events (event_name);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.trainings enable row level security;
alter table public.orders enable row level security;
alter table public.order_status_history enable row level security;
alter table public.visitor_events enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users au where au.id = auth.uid()
  );
$$;

-- Site settings: lecture publique, écriture admin
create policy "site_settings_read" on public.site_settings for select using (true);
create policy "site_settings_write" on public.site_settings for all using (public.is_admin());

-- Categories: lecture publique
create policy "categories_read" on public.categories for select using (true);
create policy "categories_write" on public.categories for all using (public.is_admin());

-- Products
create policy "products_public_read" on public.products
  for select using (is_published = true or public.is_admin());
create policy "products_admin_all" on public.products for all using (public.is_admin());

-- Product images
create policy "product_images_read" on public.product_images
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_id and (p.is_published = true or public.is_admin())
    )
  );
create policy "product_images_admin" on public.product_images for all using (public.is_admin());

-- Trainings
create policy "trainings_public_read" on public.trainings
  for select using (is_published = true or public.is_admin());
create policy "trainings_admin_all" on public.trainings for all using (public.is_admin());

-- Orders: insertion anonyme, lecture admin
create policy "orders_insert_public" on public.orders for insert with check (true);
create policy "orders_admin" on public.orders for all using (public.is_admin());

create policy "order_history_admin" on public.order_status_history for all using (public.is_admin());

-- Visitor events: insert public (anon), read admin
create policy "visitor_events_insert" on public.visitor_events for insert with check (true);
create policy "visitor_events_read_admin" on public.visitor_events for select using (public.is_admin());

-- Admin users: self read
create policy "admin_users_self" on public.admin_users for select using (auth.uid() = id);
create policy "admin_users_admin" on public.admin_users for all using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage bucket (à créer dans UI Supabase: bucket "media", public read)
-- Policies exemple — adapter au nom du bucket
-- ---------------------------------------------------------------------------
-- insert into storage.buckets (id, name, public) values ('media', 'media', true);
-- create policy "media_public_read" on storage.objects for select using (bucket_id = 'media');
-- create policy "media_admin_upload" on storage.objects for all using (bucket_id = 'media' and public.is_admin());

-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated before update on public.products
  for each row execute function public.set_updated_at();
create trigger trainings_updated before update on public.trainings
  for each row execute function public.set_updated_at();
create trigger orders_updated before update on public.orders
  for each row execute function public.set_updated_at();
create trigger site_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();
