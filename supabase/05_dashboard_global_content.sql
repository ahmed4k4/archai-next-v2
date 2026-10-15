-- Global company content and site controls managed by the authenticated admin dashboard.
-- Safe to apply to an existing Supabase project; does not create or seed project records.

alter table public.site_settings add column if not exists company_name text;
alter table public.site_settings add column if not exists logo_url text;
alter table public.site_settings add column if not exists brand_tagline_en text;
alter table public.site_settings add column if not exists brand_tagline_ar text;
alter table public.site_settings add column if not exists navigation jsonb not null default '[]'::jsonb;
alter table public.site_settings add column if not exists site_title text;
alter table public.site_settings add column if not exists home_title_en text;
alter table public.site_settings add column if not exists home_title_ar text;
alter table public.site_settings add column if not exists home_desc_en text;
alter table public.site_settings add column if not exists home_desc_ar text;
alter table public.site_settings add column if not exists contact jsonb not null default '{}'::jsonb;
alter table public.site_settings add column if not exists social jsonb not null default '{}'::jsonb;
alter table public.site_settings add column if not exists footer_text_en text;
alter table public.site_settings add column if not exists footer_text_ar text;
alter table public.site_settings add column if not exists footer_headline_en text;
alter table public.site_settings add column if not exists footer_headline_ar text;
alter table public.site_settings add column if not exists footer_accent_en text;
alter table public.site_settings add column if not exists footer_accent_ar text;
alter table public.site_settings add column if not exists default_seo_image text;
alter table public.site_settings add column if not exists section_visibility jsonb not null default '{}'::jsonb;
alter table public.site_settings add column if not exists featured_limit integer not null default 6;
alter table public.site_settings add column if not exists projects_per_category integer not null default 6;
alter table public.site_settings add column if not exists years_experience integer not null default 0;
alter table public.site_settings add column if not exists updated_at timestamptz not null default now();

-- Ensure the singleton settings record exists on older installations without overwriting edits.
insert into public.site_settings (
  id, company_name, site_title, home_title_en, home_title_ar,
  home_desc_en, home_desc_ar, brand_tagline_en, brand_tagline_ar,
  footer_headline_en, footer_headline_ar, footer_accent_en, footer_accent_ar
) values (
  1, 'Archai Integrated Systems', 'Digital Product Engineering',
  'Digital products built around real needs', 'منتجات رقمية تُبنى حول احتياج حقيقي',
  'Archai designs and engineers digital products, business platforms, AI workflows, and connected systems around real operational needs.',
  'تصمم أركاي وتطوّر المنتجات الرقمية ومنصات الأعمال وتدفقات الذكاء الاصطناعي والأنظمة المتصلة وفق احتياجات تشغيلية حقيقية.',
  'INTEGRATED SYSTEMS', 'أنظمة متكاملة', 'We design and build what', 'نصمم ونبني ما', 'the world relies on.', 'يستخدمه العالم.'
) on conflict (id) do nothing;

-- Keep existing author edits; merge only missing visibility defaults.
update public.site_settings
set section_visibility =
  '{"hero":true,"overview":true,"capabilities":true,"audience":true,"principles":true,"process":true,"faq":true,"cta":true,"projectsCta":true,"technology":true,"focus":true}'::jsonb
  || coalesce(section_visibility, '{}'::jsonb),
  contact = coalesce(contact, '{}'::jsonb),
  social = coalesce(social, '{}'::jsonb),
  brand_tagline_en = coalesce(nullif(btrim(brand_tagline_en), ''), 'INTEGRATED SYSTEMS'),
  brand_tagline_ar = coalesce(nullif(btrim(brand_tagline_ar), ''), 'أنظمة متكاملة'),
  footer_headline_en = coalesce(footer_headline_en, 'We design and build what'),
  footer_headline_ar = coalesce(footer_headline_ar, 'نصمم ونبني ما'),
  footer_accent_en = coalesce(footer_accent_en, 'the world relies on.'),
  footer_accent_ar = coalesce(footer_accent_ar, 'يستخدمه العالم.'),
  site_title = case when site_title in ('Archai — Projects', 'Archai | Digital Product Engineering') then 'Digital Product Engineering' else site_title end,
  home_title_en = case when home_title_en = 'Explore Our Digital Projects' then 'Digital products built around real needs' else home_title_en end,
  home_title_ar = case when home_title_ar = 'اكتشف مشاريعنا الرقمية' then 'منتجات رقمية تُبنى حول احتياج حقيقي' else home_title_ar end,
  home_desc_en = case when home_desc_en = 'Software, embedded and mobile solutions engineered by Archai.' then 'Archai designs and engineers digital products, business platforms, AI workflows, and connected systems around real operational needs.' else home_desc_en end,
  home_desc_ar = case when home_desc_ar = 'حلول برمجية ومدمجة وموبايل من هندسة أرشاي.' then 'تصمم أركاي وتطوّر المنتجات الرقمية ومنصات الأعمال وتدفقات الذكاء الاصطناعي والأنظمة المتصلة وفق احتياجات تشغيلية حقيقية.' else home_desc_ar end,
  navigation = case
    when jsonb_typeof(navigation) = 'array' then case
      when jsonb_array_length(navigation) > 0 then navigation
      else '[
      {"href":"about","labelAr":"عن الشركة","labelEn":"About","enabled":true},
      {"href":"services","labelAr":"الخدمات","labelEn":"Services","enabled":true},
      {"href":"projects","labelAr":"المشروعات","labelEn":"Projects","enabled":true},
      {"href":"industries","labelAr":"الصناعات","labelEn":"Industries","enabled":true},
      {"href":"process","labelAr":"منهجية العمل","labelEn":"Our process","enabled":true},
      {"href":"insights","labelAr":"الرؤى والمقالات","labelEn":"Insights","enabled":true},
      {"href":"case-studies","labelAr":"دراسات الحالة","labelEn":"Case studies","enabled":true},
      {"href":"careers","labelAr":"الوظائف","labelEn":"Careers","enabled":true},
      {"href":"faq","labelAr":"الأسئلة الشائعة","labelEn":"FAQ","enabled":true},
      {"href":"contact","labelAr":"تواصل معنا","labelEn":"Contact","enabled":true}
    ]'::jsonb
    end
    else '[
      {"href":"about","labelAr":"عن الشركة","labelEn":"About","enabled":true},
      {"href":"services","labelAr":"الخدمات","labelEn":"Services","enabled":true},
      {"href":"projects","labelAr":"المشروعات","labelEn":"Projects","enabled":true},
      {"href":"industries","labelAr":"الصناعات","labelEn":"Industries","enabled":true},
      {"href":"process","labelAr":"منهجية العمل","labelEn":"Our process","enabled":true},
      {"href":"insights","labelAr":"الرؤى والمقالات","labelEn":"Insights","enabled":true},
      {"href":"case-studies","labelAr":"دراسات الحالة","labelEn":"Case studies","enabled":true},
      {"href":"careers","labelAr":"الوظائف","labelEn":"Careers","enabled":true},
      {"href":"faq","labelAr":"الأسئلة الشائعة","labelEn":"FAQ","enabled":true},
      {"href":"contact","labelAr":"تواصل معنا","labelEn":"Contact","enabled":true}
    ]'::jsonb
  end
where id = 1;

alter table public.site_settings enable row level security;
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
drop policy if exists settings_public_read on public.site_settings;
create policy settings_public_read on public.site_settings
  for select to anon, authenticated using (true);
drop policy if exists settings_admin on public.site_settings;
create policy settings_admin on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());


-- Keep the three homepage capability labels editable for older CMS installations.
-- Preserve all existing values if an admin has already edited this field.
update public.site_page_content
set sections = coalesce(sections, '{}'::jsonb) || '{"heroCapabilities":["الأنظمة المدمجة","منصات الويب","تطبيقات الموبايل"]}'::jsonb
where page_key = 'home' and locale = 'ar'
  and not (coalesce(sections, '{}'::jsonb) ? 'heroCapabilities');

update public.site_page_content
set sections = coalesce(sections, '{}'::jsonb) || '{"heroCapabilities":["Embedded systems","Web platforms","Mobile applications"]}'::jsonb
where page_key = 'home' and locale = 'en'
  and not (coalesce(sections, '{}'::jsonb) ? 'heroCapabilities');
