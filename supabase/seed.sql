-- Seed démo — paramètres, catégories, produits, formations

insert into public.site_settings (site_name, hero_title, hero_subtitle, whatsapp_number, contact_email, seo_title, seo_description)
select
  'Merveill design',
  'Sacs artisanaux & box cadeaux sur mesure',
  'Élégance, savoir-faire et personnalisation — du premier regard à la livraison.',
  '22600000000',
  'contact@merveilldesign.bf',
  'Merveill design | Sacs à main & box cadeaux Burkina Faso',
  'Sacs à main artisanaux, coffrets cadeaux et formations à Ouagadougou et au Burkina Faso. Commande sur mesure, livraison et accompagnement premium.'
where not exists (select 1 from public.site_settings limit 1);

insert into public.categories (name, slug, type, sort_order) values
  ('Sacs à main', 'sacs', 'bag', 1),
  ('Box cadeaux', 'box-cadeaux', 'box', 2),
  ('Formations', 'formations', 'training', 3)
on conflict (slug) do nothing;

-- Exemple produits (slugs uniques)
insert into public.products (name, slug, category_id, type, short_description, description, base_price, pricing_mode, is_customizable, is_model_only, is_featured, is_published, cover_image_url, tags, display_order)
select
  'Sac cabas cuir nude',
  'sac-cabas-cuir-nude',
  c.id,
  'bag',
  'Cabas structuré, finitions main, cuir pleine fleur.',
  'Pièce signature Merveill design. Personnalisable : anse, doublure, monogramme discret.',
  125000,
  'starting_from',
  true,
  false,
  true,
  true,
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
  array['cabas', 'cuir', 'premium'],
  1
from public.categories c where c.slug = 'sacs' limit 1
on conflict (slug) do nothing;

insert into public.products (name, slug, category_id, type, short_description, base_price, pricing_mode, is_customizable, is_model_only, is_published, cover_image_url, tags, display_order)
select
  'Mini sac bandoulière',
  'mini-sac-bandouliere',
  c.id,
  'bag',
  'Format journée, lignes épurées.',
  85000,
  'starting_from',
  true,
  true,
  true,
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
  array['bandoulière', 'compact'],
  2
from public.categories c where c.slug = 'sacs' limit 1
on conflict (slug) do nothing;

insert into public.products (name, slug, category_id, type, short_description, base_price, pricing_mode, is_customizable, is_published, cover_image_url, tags, display_order)
select
  'Coffret cadeau premium',
  'coffret-cadeau-premium',
  c.id,
  'box',
  'Emballage sur mesure pour marques et événements.',
  null,
  'quote',
  true,
  true,
  'https://images.unsplash.com/photo-1549465220-576843087d93?w=800&q=80',
  array['coffret', 'entreprise'],
  1
from public.categories c where c.slug = 'box-cadeaux' limit 1
on conflict (slug) do nothing;

insert into public.trainings (title, slug, short_description, description, price, pricing_mode, duration, level, mode, is_published, cover_image_url, display_order)
values
(
  'Initiation sac à main',
  'initiation-sac',
  'Premiers pas : patronage, coupe, assemblage.',
  'Atelier présentiel — petit groupe, matériel fourni sur place.',
  75000,
  'fixed',
  '2 jours',
  'débutant',
  'presentiel',
  true,
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  1
),
(
  'Perfectionnement box & packaging',
  'perfectionnement-box',
  'Finitions, gabarits et personnalisation marque.',
  'Pour créatrices et petites marques qui veulent professionnaliser leurs coffrets.',
  null,
  'quote',
  '3 jours',
  'intermédiaire',
  'presentiel',
  true,
  'https://images.unsplash.com/photo-1513475382583-d06e58bcb0e0?w=800&q=80',
  2
)
on conflict (slug) do nothing;
