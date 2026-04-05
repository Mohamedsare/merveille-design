-- Images de bannière / sections (gérées depuis Paramètres dashboard)
alter table public.site_settings
  add column if not exists box_section_image_url text,
  add column if not exists models_section_banner_url text,
  add column if not exists trainings_section_banner_url text,
  add column if not exists how_it_works_image_url text,
  add column if not exists testimonials_section_image_url text,
  add column if not exists faq_section_image_url text,
  add column if not exists contact_section_image_url text;
