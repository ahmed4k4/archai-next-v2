-- Archai editorial CMS: database-backed bilingual pages, structured sections and SEO.
-- Apply once in Supabase SQL Editor. Seeds only page copy/settings—not project records.

create table if not exists public.site_page_content (
  id uuid primary key default gen_random_uuid(),
  page_key text not null check (page_key ~ '^[a-z0-9-]{1,80}$'),
  locale text not null check (locale in ('ar','en')),
  eyebrow text,
  title text,
  accent text,
  description text,
  primary_label text,
  primary_href text,
  secondary_label text,
  secondary_href text,
  outro_title text,
  outro_text text,
  cards jsonb not null default '[]'::jsonb check (jsonb_typeof(cards) = 'array'),
  sections jsonb not null default '{}'::jsonb check (jsonb_typeof(sections) = 'object'),
  seo_title text,
  seo_description text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_key, locale)
);

create index if not exists site_page_content_published_lookup
  on public.site_page_content (page_key, locale) where is_published = true;

alter table public.site_page_content enable row level security;
grant select on public.site_page_content to anon, authenticated;
grant insert, update, delete on public.site_page_content to authenticated;
drop policy if exists site_page_content_public_read on public.site_page_content;
create policy site_page_content_public_read on public.site_page_content
  for select to anon, authenticated using (is_published = true);
drop policy if exists site_page_content_admin_all on public.site_page_content;
create policy site_page_content_admin_all on public.site_page_content
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop trigger if exists site_page_content_set_updated_at on public.site_page_content;
create trigger site_page_content_set_updated_at before update on public.site_page_content
  for each row execute function public.set_updated_at();

-- Extend the existing settings row without overwriting values already entered by the company.
alter table public.site_settings add column if not exists years_experience integer not null default 0;
alter table public.site_settings alter column section_visibility set default
  '{"hero":true,"overview":true,"capabilities":true,"audience":true,"principles":true,"process":true,"faq":true,"cta":true,"projectsCta":true,"technology":true,"focus":true}'::jsonb;
update public.site_settings set section_visibility =
  coalesce(section_visibility, '{}'::jsonb) ||
  '{"hero":true,"overview":true,"capabilities":true,"audience":true,"principles":true,"process":true,"faq":true,"cta":true,"projectsCta":true,"technology":true,"focus":true}'::jsonb
where id = 1;

-- Published projects stay visible even if their category has been temporarily deactivated.
-- This avoids an active-category join silently hiding public project records.
drop policy if exists proj_public_read on public.projects;
create policy proj_public_read on public.projects for select to anon, authenticated
  using (status = 'published');

-- Idempotent default editorial content. Existing CMS edits are preserved by DO NOTHING.
insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'services', 'ar', 'خدمات أرشاي / 01',
  'نبني الأنظمة التي', 'تحرّك أعمالك للأمام.',
  'من مواقع ومنصات الويب إلى الأنظمة المدمجة والذكاء الاصطناعي، نصمم ونطوّر منتجات رقمية عملية تبدأ من احتياج حقيقي وتستمر مع نمو أعمالك.',
  null, null,
  null, null,
  'لديك تحدٍ تقني؟ لنحوّله إلى منتج.', 'شاركنا الفكرة والأهداف والقيود، وسنساعدك في تحديد المسار التقني الأنسب.',
  '[{"number":"01 / WEB","icon":"⌘","title":"تطوير الويب والمنصات","body":"مواقع شركات ومنتجات SaaS ولوحات تحكم وبوابات عملاء ومتاجر إلكترونية بأداء وتجربة استخدام محسّنة.","tags":["Next.js","React","E-commerce"]},{"number":"02 / SYSTEMS","icon":"▦","title":"أنظمة الأعمال وERP","body":"أنظمة مخصصة لإدارة العمليات والمخزون والعملاء والمهام والتقارير بدلًا من الأدوات المتفرقة والعمل اليدوي.","tags":["ERP","CRM","Automation"]},{"number":"03 / AI","icon":"✧","title":"الذكاء الاصطناعي","body":"مساعدات ذكية وتحليل بيانات ورؤية حاسوبية وتكامل نماذج الذكاء الاصطناعي داخل منتجات قابلة للاستخدام.","tags":["LLMs","Computer Vision","Data"]},{"number":"04 / EMBEDDED","icon":"⌁","title":"الأنظمة المدمجة وIoT","body":"Firmware وتكامل أجهزة ومستشعرات واتصالات IoT مع مراعاة قيود الذاكرة والطاقة والوقت الحقيقي.","tags":["ESP32","Firmware","IoT"]},{"number":"05 / MOBILE","icon":"▯","title":"تطبيقات الموبايل","body":"تطبيقات تربط تجربة المستخدم بخدمات الويب والواجهات الخلفية، مع بنية واضحة قابلة للصيانة.","tags":["Mobile","API","UX"]},{"number":"06 / CARE","icon":"↻","title":"التطوير والدعم المستمر","body":"مراجعات تقنية وتحسين أداء وصيانة وتطوير مرحلي لضمان استمرار المنتج وتطوره بعد الإطلاق.","tags":["QA","Optimization","Support"]}]'::jsonb, '{"cardsEyebrow":"ما نقدمه","cardsTitle":"حلول عملية.","cardsAccent":"هندسة دقيقة.","cardsDescription":"نربط الاستراتيجية والتصميم والهندسة في منظومة واحدة لبناء منتجات قابلة للاستخدام والتطوير.","proofPoints":[{"n":"01","t":"هندسة واضحة"},{"n":"02","t":"تصميم قابل للتوسع"},{"n":"03","t":"تركيز على الأثر"}],"liveSystemsEyebrow":"أنظمة مرئية","outroEyebrow":"الخطوة التالية","heroVisual":"ServiceConstellation","stripVisuals":["IndustryRings","WorkflowGraph"]}'::jsonb, 'نبني الأنظمة التي تحرّك أعمالك للأمام.',
  'من مواقع ومنصات الويب إلى الأنظمة المدمجة والذكاء الاصطناعي، نصمم ونطوّر منتجات رقمية عملية تبدأ من احتياج حقيقي وتستمر مع نمو أعمالك.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'industries', 'ar', 'حلول حسب القطاع / 02',
  'تقنية تفهم', 'طبيعة عملك.',
  'كل قطاع له تحدياته وسير عمله ومقاييس نجاحه. نبدأ بفهم البيئة التشغيلية ثم نبني حلًا يناسب المستخدمين والعمليات والمرحلة التي وصلت إليها الشركة.',
  null, null,
  null, null,
  'لم تجد قطاعك؟', 'نصمم الحل وفق احتياجاتك الفعلية، وليس وفق قالب جاهز لا يناسبك.',
  '[{"number":"01 / COMMERCE","icon":"◇","title":"التجارة والتجزئة","body":"متاجر إلكترونية وإدارة طلبات ومخزون ونقاط بيع ولوحات متابعة للمبيعات والعملاء.","tags":["E-commerce","POS","Inventory"]},{"number":"02 / INDUSTRY","icon":"⌁","title":"الصناعة والتصنيع","body":"مراقبة الأجهزة وقراءة المستشعرات وتتبع الأصول وربط الأنظمة التشغيلية بالبيانات.","tags":["IoT","Monitoring","Automation"]},{"number":"03 / EDUCATION","icon":"▤","title":"التعليم والتدريب","body":"منصات تعليمية واختبارات وإدارة محتوى ومتابعة تقدم المستخدمين والفرق.","tags":["LMS","Assessments","Analytics"]},{"number":"04 / PROFESSIONAL","icon":"▦","title":"الشركات والخدمات","body":"إدارة العملاء والمشروعات والمهام والمستندات والموافقات وسير العمل الداخلي.","tags":["CRM","Workflows","Portals"]},{"number":"05 / DIGITAL","icon":"✧","title":"المنتجات الرقمية وSaaS","body":"بناء منتجات متعددة المستخدمين مع الصلاحيات والفوترة والتقارير وتجربة استخدام متماسكة.","tags":["SaaS","Multi-tenant","Cloud"]},{"number":"06 / CONNECTED","icon":"◎","title":"الأجهزة المتصلة","body":"ربط الأجهزة والتطبيقات والسحابة لبناء تجارب ذكية تجمع بين العالم المادي والرقمي.","tags":["Embedded","Cloud","APIs"]}]'::jsonb, '{"cardsEyebrow":"ما نقدمه","cardsTitle":"حلول عملية.","cardsAccent":"هندسة دقيقة.","cardsDescription":"نربط الاستراتيجية والتصميم والهندسة في منظومة واحدة لبناء منتجات قابلة للاستخدام والتطوير.","proofPoints":[{"n":"01","t":"هندسة واضحة"},{"n":"02","t":"تصميم قابل للتوسع"},{"n":"03","t":"تركيز على الأثر"}],"liveSystemsEyebrow":"أنظمة مرئية","outroEyebrow":"الخطوة التالية","heroVisual":"IndustryRings","stripVisuals":["ServiceConstellation","SuccessMetrics"]}'::jsonb, 'تقنية تفهم طبيعة عملك.',
  'كل قطاع له تحدياته وسير عمله ومقاييس نجاحه. نبدأ بفهم البيئة التشغيلية ثم نبني حلًا يناسب المستخدمين والعمليات والمرحلة التي وصلت إليها الشركة.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'about', 'ar', 'من نحن / 03',
  'هندسة واضحة،', 'وأثر ملموس.',
  'Archai Solutions فريق تقني يربط هندسة البرمجيات والأنظمة المدمجة والذكاء الاصطناعي لبناء منتجات تخدم احتياجات حقيقية. نؤمن أن التقنية الجيدة ليست مجرد واجهة جميلة، بل نظام موثوق يمكن فهمه وتطويره والاعتماد عليه.',
  null, null,
  null, null,
  'ابنِ القادم معنا.', 'نحن نحب التحديات التي تحتاج إلى فهم عميق، قرارات واضحة وتنفيذ مسؤول.',
  '[{"number":"01 / PRINCIPLE","icon":"◎","title":"نبدأ بالمشكلة","body":"نفهم المستخدم وسير العمل والقيود قبل اختيار التقنية أو كتابة الكود.","tags":["Discovery","Requirements"]},{"number":"02 / PRINCIPLE","icon":"⌘","title":"نصمم للنمو","body":"نختار بنية واضحة تقلل التعقيد وتترك مجالًا للتطوير بدلًا من الحلول المؤقتة.","tags":["Architecture","Maintainability"]},{"number":"03 / PRINCIPLE","icon":"✓","title":"نختبر ما نبني","body":"نضع الجودة والأمان والأداء ضمن دورة التطوير، لا كخطوة أخيرة قبل التسليم.","tags":["Quality","Validation"]},{"number":"04 / PRINCIPLE","icon":"↗","title":"نقيس الأثر","body":"نربط القرارات التقنية بنتائج مفهومة مثل السرعة والاعتمادية وسهولة الاستخدام.","tags":["Outcomes","Performance"]},{"number":"05 / PRINCIPLE","icon":"↻","title":"نتعاون بشفافية","body":"نوضح النطاق والأولويات والمخاطر والتقدم حتى تكون القرارات مشتركة وواضحة.","tags":["Communication","Delivery"]},{"number":"06 / PRINCIPLE","icon":"✧","title":"نتطور باستمرار","body":"نراجع ما تعلمناه ونحسن الأدوات والعمليات بما يخدم المنتج على المدى الطويل.","tags":["Iteration","Learning"]}]'::jsonb, '{"cardsEyebrow":"ما نقدمه","cardsTitle":"حلول عملية.","cardsAccent":"هندسة دقيقة.","cardsDescription":"نربط الاستراتيجية والتصميم والهندسة في منظومة واحدة لبناء منتجات قابلة للاستخدام والتطوير.","proofPoints":[{"n":"01","t":"هندسة واضحة"},{"n":"02","t":"تصميم قابل للتوسع"},{"n":"03","t":"تركيز على الأثر"}],"liveSystemsEyebrow":"أنظمة مرئية","outroEyebrow":"الخطوة التالية","heroVisual":"TeamOrbit","stripVisuals":["DNAHelix","KnowledgeFragments"]}'::jsonb, 'هندسة واضحة، وأثر ملموس.',
  'Archai Solutions فريق تقني يربط هندسة البرمجيات والأنظمة المدمجة والذكاء الاصطناعي لبناء منتجات تخدم احتياجات حقيقية. نؤمن أن التقنية الجيدة ليست مجرد واجهة جميلة، بل نظام موثوق يمكن فهمه وتطويره والاعتماد عليه.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'process', 'ar', 'منهجية العمل / 04',
  'من الفكرة إلى', 'منتج يمكن الاعتماد عليه.',
  'عملية منظمة ومرنة تمنحك رؤية واضحة لما سنبنيه ولماذا، وكيف سنختبره ونطلقه ونطوره. نجزّئ التعقيد إلى مراحل يمكن مراجعتها وقياسها.',
  null, null,
  null, null,
  'ابدأ بخطوة واضحة.', 'جلسة اكتشاف جيدة توفر وقتًا وتقلل المخاطر قبل الالتزام بالتنفيذ.',
  '[{"number":"01 / DISCOVER","icon":"⌕","title":"الاكتشاف وتحديد النطاق","body":"نحدد أهداف المنتج والمستخدمين والقيود والأولويات ومعايير النجاح.","tags":["Goals","Requirements"]},{"number":"02 / DEFINE","icon":"▤","title":"المتطلبات وتجربة الاستخدام","body":"نرتب تدفقات المستخدم والوظائف الأساسية وحالات الخطأ والمحتوى المطلوب.","tags":["User flows","UX"]},{"number":"03 / ARCHITECT","icon":"⌘","title":"التصميم والمعمارية","body":"نختار بنية النظام ونموذج البيانات والتكاملات ونحدد المخاطر والقرارات المهمة.","tags":["Architecture","Data"]},{"number":"04 / BUILD","icon":"⚙","title":"التنفيذ المرحلي","body":"نبني على دفعات قابلة للمراجعة، مع متابعة التقدم وعرض نتائج فعلية باستمرار.","tags":["Implementation","Reviews"]},{"number":"05 / VERIFY","icon":"✓","title":"الاختبار والتحقق","body":"نختبر الوظائف والاستجابة والأمان وتجربة الأجهزة المختلفة قبل الإطلاق.","tags":["QA","Acceptance"]},{"number":"06 / LAUNCH","icon":"↗","title":"الإطلاق والتحسين","body":"نراقب الأداء ونصلح المشكلات ونخطط للتحسينات وفق الاستخدام والبيانات.","tags":["Release","Support"]}]'::jsonb, '{"cardsEyebrow":"ما نقدمه","cardsTitle":"حلول عملية.","cardsAccent":"هندسة دقيقة.","cardsDescription":"نربط الاستراتيجية والتصميم والهندسة في منظومة واحدة لبناء منتجات قابلة للاستخدام والتطوير.","proofPoints":[{"n":"01","t":"هندسة واضحة"},{"n":"02","t":"تصميم قابل للتوسع"},{"n":"03","t":"تركيز على الأثر"}],"liveSystemsEyebrow":"أنظمة مرئية","outroEyebrow":"الخطوة التالية","heroVisual":"WorkflowGraph","stripVisuals":["SuccessMetrics","ServiceConstellation"]}'::jsonb, 'من الفكرة إلى منتج يمكن الاعتماد عليه.',
  'عملية منظمة ومرنة تمنحك رؤية واضحة لما سنبنيه ولماذا، وكيف سنختبره ونطلقه ونطوره. نجزّئ التعقيد إلى مراحل يمكن مراجعتها وقياسها.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'insights', 'ar', 'المعرفة والرؤى / 05',
  'قرارات تقنية', 'أوضح وأذكى.',
  'مبادئ عملية تساعد أصحاب المنتجات والفرق التقنية على فهم الخيارات، تقليل المخاطر وبناء حلول قابلة للاستمرار. هذه الصفحة نقطة انطلاق لمكتبة مقالات الشركة ويمكن توسيعها لاحقًا بنظام CMS.',
  null, null,
  null, null,
  'لديك سؤال تقني؟', 'صف التحدي الذي تواجهه وسنساعدك على تحديد الأسئلة الصحيحة قبل اختيار الحل.',
  '[{"number":"01 / GUIDE","icon":"⌘","title":"كيف تختار التقنية المناسبة؟","body":"ابدأ بالقيود والاحتياجات والفريق والميزانية؛ لا تجعل اسم التقنية هو نقطة البداية.","tags":["Architecture","Decision making"]},{"number":"02 / GUIDE","icon":"▦","title":"متى تحتاج نظامًا مخصصًا؟","body":"عندما تصبح العمليات الأساسية مختلفة عن القوالب الجاهزة أو تحتاج تكاملًا وتحكمًا أكبر.","tags":["Custom software","Operations"]},{"number":"03 / GUIDE","icon":"✧","title":"إدخال AI إلى منتجك","body":"حدد المهمة والبيانات ومعيار الدقة وتكلفة التشغيل وطريقة التعامل مع الأخطاء قبل اختيار النموذج.","tags":["AI","Product strategy"]},{"number":"04 / GUIDE","icon":"◈","title":"لماذا تبدأ بالأمان؟","body":"الصلاحيات وإدارة الأسرار والتحقق من المدخلات والنسخ الاحتياطية جزء من التصميم الأساسي.","tags":["Security","Reliability"]},{"number":"05 / GUIDE","icon":"↗","title":"قياس أداء الموقع","body":"راقب سرعة التحميل وتفاعل المستخدم وأخطاء الواجهة، ثم حسّن نقاط الاختناق بناءً على القياس.","tags":["Web","Performance"]},{"number":"06 / GUIDE","icon":"⌁","title":"متى تحتاج إلى IoT؟","body":"عندما تتيح البيانات القادمة من العالم الفعلي قرارًا أفضل أو أتمتة أو مراقبة لم تكن ممكنة.","tags":["IoT","Embedded"]}]'::jsonb, '{"cardsEyebrow":"ما نقدمه","cardsTitle":"حلول عملية.","cardsAccent":"هندسة دقيقة.","cardsDescription":"نربط الاستراتيجية والتصميم والهندسة في منظومة واحدة لبناء منتجات قابلة للاستخدام والتطوير.","proofPoints":[{"n":"01","t":"هندسة واضحة"},{"n":"02","t":"تصميم قابل للتوسع"},{"n":"03","t":"تركيز على الأثر"}],"liveSystemsEyebrow":"أنظمة مرئية","outroEyebrow":"الخطوة التالية","heroVisual":"KnowledgeFragments","stripVisuals":["SignalBeacon","WorkflowGraph"]}'::jsonb, 'قرارات تقنية أوضح وأذكى.',
  'مبادئ عملية تساعد أصحاب المنتجات والفرق التقنية على فهم الخيارات، تقليل المخاطر وبناء حلول قابلة للاستمرار. هذه الصفحة نقطة انطلاق لمكتبة مقالات الشركة ويمكن توسيعها لاحقًا بنظام CMS.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'contact', 'ar', 'تواصل معنا / 06',
  'دعنا نفهم', 'ما تريد بناءه.',
  'سواء كانت لديك متطلبات واضحة أو ما زلت تستكشف الفكرة، ابدأ بمشاركة الهدف والمشكلة والوقت المتوقع. سنحوّل المحادثة الأولى إلى خطوات عملية.',
  null, null,
  null, null,
  'لديك مشروع في ذهنك؟', 'ابدأ بتحديد احتياجك في نموذج المشروع، أو تواصل معنا عبر البريد الإلكتروني.',
  '[{"number":"01 / START","icon":"↗","title":"ابدأ مشروعك","body":"أرسل وصفًا أوليًا للفكرة والميزات الأساسية والجدول الزمني المتوقع.","tags":["Project brief","Discovery"]},{"number":"02 / EMAIL","icon":"✉","title":"راسل فريقنا","body":"يمكنك إرسال تفاصيل المشروع أو الاستفسارات إلى بريد الشركة.","tags":["Business inquiries","Support"]},{"number":"03 / SCOPE","icon":"▤","title":"حدد الأولويات","body":"ابدأ بما تحتاجه الآن، وما الذي يمكن تأجيله، وكيف ستقيس نجاح الحل.","tags":["Scope","Roadmap"]}]'::jsonb, '{"cardsEyebrow":"ما نقدمه","cardsTitle":"حلول عملية.","cardsAccent":"هندسة دقيقة.","cardsDescription":"نربط الاستراتيجية والتصميم والهندسة في منظومة واحدة لبناء منتجات قابلة للاستخدام والتطوير.","proofPoints":[{"n":"01","t":"هندسة واضحة"},{"n":"02","t":"تصميم قابل للتوسع"},{"n":"03","t":"تركيز على الأثر"}],"liveSystemsEyebrow":"أنظمة مرئية","outroEyebrow":"الخطوة التالية","heroVisual":"SignalBeacon","stripVisuals":["WorkflowGraph","KnowledgeFragments"]}'::jsonb, 'دعنا نفهم ما تريد بناءه.',
  'سواء كانت لديك متطلبات واضحة أو ما زلت تستكشف الفكرة، ابدأ بمشاركة الهدف والمشكلة والوقت المتوقع. سنحوّل المحادثة الأولى إلى خطوات عملية.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'faq', 'ar', 'الأسئلة الشائعة',
  'إجابات واضحة', 'قبل أن نبدأ',
  'معلومات تساعدك على فهم طريقة العمل، نطاق المشاريع، والتعاون مع Archai.',
  null, null,
  null, null,
  'لم تجد إجابتك؟', 'أرسل سؤالك من صفحة التواصل وسنساعدك في تحديد الخطوة المناسبة.',
  '[{"number":"01","icon":"◈","title":"ما أنواع المشاريع التي تنفذونها؟","body":"نحدد الأهداف والمستخدمين والقيود أولًا.","tags":["GUIDANCE","SCOPE"]},{"number":"02","icon":"✳","title":"كيف يبدأ المشروع؟","body":"نقسم العمل إلى مراحل ومخرجات واضحة.","tags":["GUIDANCE","DELIVERY"]},{"number":"03","icon":"⌘","title":"كيف تتم متابعة التقدم؟","body":"نتفق على نقاط مراجعة وتواصل منتظم.","tags":["GUIDANCE","REVIEW"]},{"number":"04","icon":"↗","title":"هل يمكن تطوير مشروع قائم؟","body":"نراجع البنية الحالية قبل اقتراح التعديلات.","tags":["GUIDANCE","LEGACY"]}]'::jsonb, '{"cardsEyebrow":"ما نقدمه","cardsTitle":"حلول عملية.","cardsAccent":"هندسة دقيقة.","cardsDescription":"نربط الاستراتيجية والتصميم والهندسة في منظومة واحدة لبناء منتجات قابلة للاستخدام والتطوير.","proofPoints":[{"n":"01","t":"هندسة واضحة"},{"n":"02","t":"تصميم قابل للتوسع"},{"n":"03","t":"تركيز على الأثر"}],"liveSystemsEyebrow":"أنظمة مرئية","outroEyebrow":"الخطوة التالية","heroVisual":"QABubbles","stripVisuals":["KnowledgeFragments","SignalBeacon"]}'::jsonb, 'إجابات واضحة قبل أن نبدأ',
  'معلومات تساعدك على فهم طريقة العمل، نطاق المشاريع، والتعاون مع Archai.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'careers', 'ar', 'الوظائف',
  'ابنِ ما', 'سيستخدمه العالم',
  'نبحث عن أشخاص يحبون حل المشكلات والتعلم المستمر وتحمل مسؤولية المنتج من الفكرة إلى الإطلاق.',
  null, null,
  null, null,
  'خلينا نتعرف عليك', 'أرسل نبذة عن خبرتك ومجالات اهتمامك وروابط أعمالك.',
  '[{"number":"01","icon":"◈","title":"هندسة البرمجيات","body":"تفكير عملي وحل المشكلات.","tags":["CAREER","TEAM"]},{"number":"02","icon":"✳","title":"تصميم UI/UX","body":"تواصل واضح والعمل بروح الفريق.","tags":["CAREER","DESIGN"]},{"number":"03","icon":"⌘","title":"الذكاء الاصطناعي والأتمتة","body":"اهتمام بالجودة وتجربة المستخدم.","tags":["CAREER","AI"]},{"number":"04","icon":"↗","title":"الأنظمة المدمجة وIoT","body":"فضول تقني وتعلم مستمر.","tags":["CAREER","IOT"]}]'::jsonb, '{"cardsEyebrow":"ما نقدمه","cardsTitle":"حلول عملية.","cardsAccent":"هندسة دقيقة.","cardsDescription":"نربط الاستراتيجية والتصميم والهندسة في منظومة واحدة لبناء منتجات قابلة للاستخدام والتطوير.","proofPoints":[{"n":"01","t":"هندسة واضحة"},{"n":"02","t":"تصميم قابل للتوسع"},{"n":"03","t":"تركيز على الأثر"}],"liveSystemsEyebrow":"أنظمة مرئية","outroEyebrow":"الخطوة التالية","heroVisual":"DNAHelix","stripVisuals":["TeamOrbit","KnowledgeFragments"]}'::jsonb, 'ابنِ ما سيستخدمه العالم',
  'نبحث عن أشخاص يحبون حل المشكلات والتعلم المستمر وتحمل مسؤولية المنتج من الفكرة إلى الإطلاق.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'case-studies', 'ar', 'دراسات حالة منشورة',
  'العمل الحقيقي', 'هو ما يحكي القصة',
  'تعرض هذه الصفحة المشروعات المنشورة والمميزة من قاعدة بيانات أركاي فقط. لا تُنشأ دراسات حالة وهمية أو سجلات مشاريع ثابتة داخل الكود.',
  null, null,
  null, null,
  null, null,
  '[]'::jsonb, '{"cardsEyebrow":"ما نقدمه","cardsTitle":"حلول عملية.","cardsAccent":"هندسة دقيقة.","cardsDescription":"نربط الاستراتيجية والتصميم والهندسة في منظومة واحدة لبناء منتجات قابلة للاستخدام والتطوير.","proofPoints":[{"n":"01","t":"هندسة واضحة"},{"n":"02","t":"تصميم قابل للتوسع"},{"n":"03","t":"تركيز على الأثر"}],"liveSystemsEyebrow":"أنظمة مرئية","outroEyebrow":"الخطوة التالية","heroVisual":"ServiceConstellation","stripVisuals":["WorkflowGraph","KnowledgeFragments"],"list":"دراسات الحالة","listDescription":"تُدار أسماء المشروعات وصورها وبياناتها وتقنياتها وروابطها من لوحة الإدارة.","emptyTitle":"لا توجد دراسات حالة منشورة بعد","emptyBody":"انشر مشروعًا من لوحة الإدارة وحدد أنه مميز ليظهر هنا. يمكنك حاليًا استكشاف الخدمات أو التواصل لمناقشة احتياجك.","unavailableTitle":"بيانات المشروعات غير متاحة","unavailableBody":"تعذر الاتصال ببيانات المشروعات. تحقق من إعدادات Supabase وصلاحيات القراءة RLS. لا يعرض الموقع بيانات مشروعات ثابتة كبديل.","services":"الخدمات","contact":"تواصل معنا"}'::jsonb, 'العمل الحقيقي هو ما يحكي القصة',
  'تعرض هذه الصفحة المشروعات المنشورة والمميزة من قاعدة بيانات أركاي فقط. لا تُنشأ دراسات حالة وهمية أو سجلات مشاريع ثابتة داخل الكود.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'projects', 'ar', 'فهرس المشروعات',
  'أعمال رقمية', 'مصممة لهدف واضح',
  'استكشف المشروعات المنشورة من لوحة إدارة أركاي. كل عنوان وصورة وتقنية وتصنيف ورابط في هذا الأرشيف يأتي من قاعدة البيانات، ولا نعرض سجلات مشروعات تجريبية ثابتة داخل الموقع.',
  null, null,
  null, null,
  null, null,
  '[]'::jsonb, '{"cardsEyebrow":"ما نقدمه","cardsTitle":"حلول عملية.","cardsAccent":"هندسة دقيقة.","cardsDescription":"نربط الاستراتيجية والتصميم والهندسة في منظومة واحدة لبناء منتجات قابلة للاستخدام والتطوير.","proofPoints":[{"n":"01","t":"هندسة واضحة"},{"n":"02","t":"تصميم قابل للتوسع"},{"n":"03","t":"تركيز على الأثر"}],"liveSystemsEyebrow":"أنظمة مرئية","outroEyebrow":"الخطوة التالية","heroVisual":"ServiceConstellation","stripVisuals":["WorkflowGraph","KnowledgeFragments"],"catalogue":"استكشف الأرشيف","catalogueDescription":"ابحث بالاسم، أو صفِّ النتائج حسب المجال والتقنيات المسجلة للمشروع.","services":"استكشف الخدمات","contact":"ناقش مشروعًا جديدًا","unconfiguredTitle":"اربط قاعدة البيانات لعرض المشروعات","unconfiguredBody":"لا توجد سجلات مشروعات محلية بديلة في الكود. أضف إعدادات Supabase وصلاحيات القراءة، وستظهر المشروعات المنشورة المسجلة في لوحة الإدارة هنا.","errorTitle":"تعذر قراءة بيانات المشروعات","errorBody":"لم يتم عرض بيانات ثابتة بديلة. تحقق من اتصال Supabase، وسياسات القراءة RLS، وبنية جدول projects والعلاقات المرتبطة به.","compatibilityTitle":"تم تحميل البيانات بوضع التوافق","compatibilityBody":"بعض الحقول الاختيارية أو العلاقات لم تكن متاحة، لذلك تعرض الصفحة السجلات التي أمكن قراءتها من قاعدة البيانات. راجع ترحيلات المخطط إذا كانت الصور أو التقنيات ناقصة.","emptyTitle":"لا توجد مشروعات منشورة حاليًا","emptyBody":"عند نشر مشروع من لوحة الإدارة سيظهر هنا تلقائيًا. يمكنك التعرف على الخدمات أو بدء محادثة حول فكرتك في الوقت الحالي."}'::jsonb, 'أعمال رقمية مصممة لهدف واضح',
  'استكشف المشروعات المنشورة من لوحة إدارة أركاي. كل عنوان وصورة وتقنية وتصنيف ورابط في هذا الأرشيف يأتي من قاعدة البيانات، ولا نعرض سجلات مشروعات تجريبية ثابتة داخل الموقع.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'home', 'ar', 'الهندسة الرقمية / ARCHAI',
  null, null,
  'منتجات رقمية ومنصات ويب وحلول ذكاء اصطناعي وأنظمة مدمجة وإنترنت الأشياء، تُبنى حول احتياجات العمل الحقيقية.',
  'اكتشف أعمالنا', '/ar/projects',
  'عن أركاي', '/ar/about',
  null, null,
  '[]'::jsonb, '{"cardsEyebrow":"ما نقدمه","cardsTitle":"حلول عملية.","cardsAccent":"هندسة دقيقة.","cardsDescription":"نربط الاستراتيجية والتصميم والهندسة في منظومة واحدة لبناء منتجات قابلة للاستخدام والتطوير.","proofPoints":[{"n":"01","t":"هندسة واضحة"},{"n":"02","t":"تصميم قابل للتوسع"},{"n":"03","t":"تركيز على الأثر"}],"liveSystemsEyebrow":"أنظمة مرئية","outroEyebrow":"الخطوة التالية","heroVisual":"ServiceConstellation","heroCapabilities":["الأنظمة المدمجة","منصات الويب","تطبيقات الموبايل"],"stripVisuals":["WorkflowGraph","KnowledgeFragments"],"sections":{"homeOverview":{"eyebrow":"من الفكرة إلى الإطلاق","title":"نبني أنظمة رقمية تعمل معًا، لا مجرد صفحات منفصلة","description":"تجمع أركاي بين هندسة البرمجيات والتصميم وتجربة المستخدم والأنظمة الذكية لتحويل احتياجات العمل إلى منتجات عملية قابلة للتطوير.","capabilitiesTitle":"ما الذي يمكننا بناؤه؟","capabilities":[{"number":"01","title":"المنتجات والمنصات الرقمية","text":"مواقع مؤسسية، متاجر إلكترونية، لوحات تحكم وتطبيقات ويب مصممة لتكون سريعة وسهلة الاستخدام."},{"number":"02","title":"الذكاء الاصطناعي والأتمتة","text":"دمج نماذج الذكاء الاصطناعي في سير العمل، وأتمتة المهام المتكررة، وبناء أدوات تساعد الفرق على اتخاذ قرارات أفضل."},{"number":"03","title":"الأنظمة المدمجة وإنترنت الأشياء","text":"ربط الأجهزة والمستشعرات والأنظمة المادية بالبرمجيات ولوحات المتابعة والتحكم."},{"number":"04","title":"أنظمة الأعمال والبيانات","text":"أنظمة إدارة داخلية، تكاملات API، تقارير ولوحات مؤشرات تساعد على تنظيم العمليات ومتابعة الأداء."}],"audienceEyebrow":"لمن نبني الحلول؟","audienceTitle":"حلول تقنية تناسب سياقات عمل مختلفة","audiences":[{"title":"شركات في مرحلة النمو","text":"منصات قابلة للتوسع بدل إعادة بناء النظام كلما زاد حجم العمل."},{"title":"فرق التشغيل والإدارة","text":"لوحات تحكم وتكاملات تساعد على تقليل العمل اليدوي ورؤية العمليات بوضوح."},{"title":"منتجات رقمية جديدة","text":"تحويل الفكرة إلى نطاق واضح وتجربة قابلة للاختبار ثم التطوير على مراحل."},{"title":"أجهزة وأنظمة متصلة","text":"ربط الأجهزة والمستشعرات والبرمجيات ضمن تجربة واحدة قابلة للمتابعة."}],"principlesTitle":"معايير نضعها في كل مشروع","principles":[{"title":"أداء محسوب","text":"نراعي سرعة التحميل واستجابة الواجهة وحجم الموارد منذ بداية التخطيط."},{"title":"بنية قابلة للصيانة","text":"نفضّل تنظيمًا واضحًا ومكونات قابلة لإعادة الاستخدام يسهل تطويرها لاحقًا."},{"title":"تكامل عملي","text":"نصمم واجهات API وتدفقات البيانات لتتوافق مع الأدوات والأنظمة الموجودة عند الحاجة."},{"title":"اختبار قبل الإطلاق","text":"نراجع المسارات الأساسية وحالات الخطأ والتوافق قبل اعتبار العمل جاهزًا."}],"processTitle":"طريقة عمل واضحة من البداية","process":[{"number":"01","title":"نفهم الهدف","text":"نحدد المشكلة والمستخدمين والأولويات قبل اختيار التقنية."},{"number":"02","title":"نخطط التجربة","text":"نرتب تدفق الاستخدام والواجهات وبنية الحل حول احتياج حقيقي."},{"number":"03","title":"نبني ونختبر","text":"نطور على مراحل، ونراجع الوظائف والأداء والتوافق قبل الإطلاق."},{"number":"04","title":"نطلق ونحسن","text":"نجهز الحل للنشر ونحدد فرص التطوير بناءً على الاستخدام والنتائج."}],"note":"كل مشروع له نطاقه وأولوياته؛ نختار الأدوات والبنية بناءً على احتياجه بدل فرض حل واحد على الجميع.","faqEyebrow":"قبل أن نبدأ","faqTitle":"أسئلة مهمة في بداية أي مشروع","questions":[{"q":"هل يمكن ربط الحل بأنظمتنا الحالية؟","a":"نراجع الأنظمة الحالية وواجهات API وتدفقات البيانات أولًا، ثم نحدد ما يمكن تكامله بأمان ووضوح ضمن النطاق."},{"q":"هل يمكن تطوير منتج موجود بالفعل؟","a":"نعم؛ يمكن بدء العمل بمراجعة تجربة الاستخدام والأداء والبنية التقنية، ثم ترتيب التحسينات حسب أثرها وأولويتها."},{"q":"كيف نحدد الوقت والتكلفة؟","a":"نحدد المطلوب والقيود والأولويات أولًا، ثم نقسم العمل إلى مراحل ونوضح نطاق كل مرحلة قبل الالتزام بالتنفيذ."}],"faqLink":"كل الأسئلة الشائعة","ctaTitle":"لديك فكرة أو تحدٍ تقني؟","ctaText":"شاركنا الهدف، وسنساعدك في تحديد الخطوة العملية التالية ونطاق الحل المناسب.","services":"استكشف خدماتنا","contact":"ناقش مشروعك"},"technology":{"eyebrow":"التقنيات / 007","title":"نختار التقنية المناسبة للمشكلة الحقيقية.","description":"نختار التقنيات وفق ملاءمتها وموثوقيتها وسهولة صيانتها وأدائها، لا لمجرد انتشارها. تتحدد الأدوات بحسب احتياجات المنتج وقيود التشغيل الفعلية.","note":"يختلف الاختيار التقني حسب نطاق المشروع والتكاملات والفريق وبيئة التشغيل.","link":"استكشف خدماتنا الهندسية"},"technologyStacks":[{"en":"Frontend engineering","ar":"تطوير الواجهات","items":["React","TypeScript","Next.js","Tailwind CSS","Three.js","Framer Motion"],"tone":"violet"},{"en":"Backend & data","ar":"الخلفية والبيانات","items":["Node.js","Python","Go","Rust","PostgreSQL","Redis"],"tone":"mint"},{"en":"Embedded systems","ar":"الأنظمة المدمجة","items":["C / C++","Zephyr RTOS","FreeRTOS","ARM Cortex-M","FPGA","VHDL / Verilog"],"tone":"blue"},{"en":"AI & machine learning","ar":"الذكاء الاصطناعي وتعلم الآلة","items":["PyTorch","TensorFlow","ONNX Runtime","Hugging Face","LangChain","OpenCV"],"tone":"violet"},{"en":"Cloud & DevOps","ar":"السحابة وعمليات التطوير","items":["Kubernetes","Docker","AWS","Google Cloud","Terraform","GitLab CI"],"tone":"mint"},{"en":"IoT & connectivity","ar":"إنترنت الأشياء والاتصال","items":["MQTT","LoRaWAN","BLE","Modbus","OPC UA","Thread"],"tone":"blue"},{"en":"Mobile applications","ar":"تطبيقات الهواتف","items":["React Native","Flutter","Swift","Kotlin","Expo","Capacitor"],"tone":"violet"}],"focus":{"headingAr":"مجالاتنا الهندسية","headingEn":"ENGINEERING FOCUS","descriptionAr":"مجموعة من التخصصات التي ندمجها وفق احتياج كل منتج، وليست قائمة عملاء أو شعارات تجارية.","descriptionEn":"A practical set of disciplines we combine around each product’s needs—not a list of client brands or endorsements.","items":["هندسة المنتجات الرقمية","الذكاء الاصطناعي وأتمتة سير العمل","الأنظمة المدمجة","إنترنت الأشياء والاتصال","منصات الأعمال","البيانات وتكامل واجهات API","تجربة استخدام عالية الأداء","تجارب ثلاثية الأبعاد تفاعلية"]},"homeProjectsCTA":{"eyebrowAr":"أرشيف الأعمال","eyebrowEn":"PROJECT ARCHIVE","titleAr":"كل مشروع له هدف. وكل حل يبدأ بفهم المشكلة.","titleEn":"Every project has a purpose. Every solution starts by understanding the problem.","descriptionAr":"تصفح مجموعة مشروعات أركاي في صفحة مستقلة، واكتشف أنواع المنتجات الرقمية والأنظمة التي نصممها ونطورها، مع تفاصيل كل مشروع وتقنياته وروابطه المتاحة.","descriptionEn":"Explore Archai’s work in a dedicated catalogue with project details, technologies, categories and available live links—without turning the homepage into a crowded portfolio grid.","primaryAr":"استكشف كل المشروعات","primaryEn":"Explore all projects","secondaryAr":"منهجية دراسات الحالة","secondaryEn":"How we approach case studies"}}}'::jsonb, 'الحلول البرمجية والذكاء الاصطناعي والمنتجات الرقمية',
  'أركاي للحلول البرمجية: نبني المنتجات الرقمية ومنصات الويب وحلول الذكاء الاصطناعي والأنظمة المدمجة وإنترنت الأشياء.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'services', 'en', 'ARCHAI SERVICES / 01',
  'We build systems that', 'move your business forward.',
  'From websites and SaaS platforms to embedded systems and AI, we engineer useful digital products around real needs and evolving business goals.',
  null, null,
  null, null,
  'Have a technical challenge? Let’s shape it into a product.', 'Share your idea, goals and constraints, and we’ll help map a sensible technical path.',
  '[{"number":"01 / WEB","icon":"⌘","title":"Websites & platforms","body":"Company websites, SaaS products, dashboards, customer portals and e-commerce experiences designed for performance.","tags":["Next.js","React","E-commerce"]},{"number":"02 / SYSTEMS","icon":"▦","title":"Business systems & ERP","body":"Custom tools for operations, inventory, customers, tasks and reporting—replacing disconnected manual workflows.","tags":["ERP","CRM","Automation"]},{"number":"03 / AI","icon":"✧","title":"Artificial intelligence","body":"AI assistants, data analysis, computer vision and practical model integrations inside usable products.","tags":["LLMs","Computer Vision","Data"]},{"number":"04 / EMBEDDED","icon":"⌁","title":"Embedded & IoT","body":"Firmware, device integration, sensors and connected systems engineered around memory, power and timing constraints.","tags":["ESP32","Firmware","IoT"]},{"number":"05 / MOBILE","icon":"▯","title":"Mobile applications","body":"Mobile experiences connected to reliable web services and maintainable backend systems.","tags":["Mobile","API","UX"]},{"number":"06 / CARE","icon":"↻","title":"Continuous improvement","body":"Technical reviews, performance tuning, maintenance and iterative product evolution after launch.","tags":["QA","Optimization","Support"]}]'::jsonb, '{"cardsEyebrow":"WHAT WE DO","cardsTitle":"Practical solutions.","cardsAccent":"Precise engineering.","cardsDescription":"Strategy, design and engineering work as one system to build digital products that scale.","proofPoints":[{"n":"01","t":"Clear engineering"},{"n":"02","t":"Built to scale"},{"n":"03","t":"Outcome focused"}],"liveSystemsEyebrow":"LIVE SYSTEMS","outroEyebrow":"NEXT STEP","heroVisual":"ServiceConstellation","stripVisuals":["IndustryRings","WorkflowGraph"]}'::jsonb, 'We build systems that move your business forward.',
  'From websites and SaaS platforms to embedded systems and AI, we engineer useful digital products around real needs and evolving business goals.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'industries', 'en', 'INDUSTRIES / 02',
  'Technology that understands', 'how your business works.',
  'Every industry has its own workflows, constraints and success metrics. We learn the operating context before designing a solution around your people and processes.',
  null, null,
  null, null,
  'Your industry is not listed?', 'We shape the solution around your real needs instead of forcing a generic template.',
  '[{"number":"01 / COMMERCE","icon":"◇","title":"Commerce & retail","body":"Online stores, order management, inventory, point-of-sale and sales insights.","tags":["E-commerce","POS","Inventory"]},{"number":"02 / INDUSTRY","icon":"⌁","title":"Industrial operations","body":"Device monitoring, sensor data, asset tracking and connected operational systems.","tags":["IoT","Monitoring","Automation"]},{"number":"03 / EDUCATION","icon":"▤","title":"Education & training","body":"Learning platforms, assessments, content management and learner progress tracking.","tags":["LMS","Assessments","Analytics"]},{"number":"04 / PROFESSIONAL","icon":"▦","title":"Professional services","body":"Customer, project, task, document, approval and internal workflow management.","tags":["CRM","Workflows","Portals"]},{"number":"05 / DIGITAL","icon":"✧","title":"Digital products & SaaS","body":"Multi-user products with permissions, billing, reporting and a cohesive user experience.","tags":["SaaS","Multi-tenant","Cloud"]},{"number":"06 / CONNECTED","icon":"◎","title":"Connected devices","body":"Connect hardware, applications and cloud services to bridge physical and digital experiences.","tags":["Embedded","Cloud","APIs"]}]'::jsonb, '{"cardsEyebrow":"WHAT WE DO","cardsTitle":"Practical solutions.","cardsAccent":"Precise engineering.","cardsDescription":"Strategy, design and engineering work as one system to build digital products that scale.","proofPoints":[{"n":"01","t":"Clear engineering"},{"n":"02","t":"Built to scale"},{"n":"03","t":"Outcome focused"}],"liveSystemsEyebrow":"LIVE SYSTEMS","outroEyebrow":"NEXT STEP","heroVisual":"IndustryRings","stripVisuals":["ServiceConstellation","SuccessMetrics"]}'::jsonb, 'Technology that understands how your business works.',
  'Every industry has its own workflows, constraints and success metrics. We learn the operating context before designing a solution around your people and processes.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'about', 'en', 'ABOUT ARCHAI / 03',
  'Clear engineering,', 'measurable impact.',
  'Archai Solutions brings software engineering, embedded systems and AI together to build products for real needs. Great technology is more than a polished interface: it is a reliable system people can understand, extend and trust.',
  null, null,
  null, null,
  'Build what comes next with us.', 'We enjoy challenges that demand deep understanding, clear decisions and responsible execution.',
  '[{"number":"01 / PRINCIPLE","icon":"◎","title":"Start with the problem","body":"Understand users, workflows and constraints before selecting technology or writing code.","tags":["Discovery","Requirements"]},{"number":"02 / PRINCIPLE","icon":"⌘","title":"Design for growth","body":"Choose clear architecture that reduces complexity and leaves room to evolve.","tags":["Architecture","Maintainability"]},{"number":"03 / PRINCIPLE","icon":"✓","title":"Verify what we build","body":"Quality, security and performance belong throughout delivery, not only at the end.","tags":["Quality","Validation"]},{"number":"04 / PRINCIPLE","icon":"↗","title":"Measure outcomes","body":"Connect technical decisions to understandable outcomes like speed, reliability and usability.","tags":["Outcomes","Performance"]},{"number":"05 / PRINCIPLE","icon":"↻","title":"Collaborate transparently","body":"Make scope, priorities, risks and progress visible so decisions are shared and clear.","tags":["Communication","Delivery"]},{"number":"06 / PRINCIPLE","icon":"✧","title":"Keep improving","body":"Learn from delivery and refine tools and processes for long-term product health.","tags":["Iteration","Learning"]}]'::jsonb, '{"cardsEyebrow":"WHAT WE DO","cardsTitle":"Practical solutions.","cardsAccent":"Precise engineering.","cardsDescription":"Strategy, design and engineering work as one system to build digital products that scale.","proofPoints":[{"n":"01","t":"Clear engineering"},{"n":"02","t":"Built to scale"},{"n":"03","t":"Outcome focused"}],"liveSystemsEyebrow":"LIVE SYSTEMS","outroEyebrow":"NEXT STEP","heroVisual":"TeamOrbit","stripVisuals":["DNAHelix","KnowledgeFragments"]}'::jsonb, 'Clear engineering, measurable impact.',
  'Archai Solutions brings software engineering, embedded systems and AI together to build products for real needs. Great technology is more than a polished interface: it is a reliable system people can understand, extend and trust.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'process', 'en', 'OUR PROCESS / 04',
  'From idea to', 'a product you can trust.',
  'A structured, flexible process gives you visibility into what we build, why it matters and how we verify, launch and improve it. We turn complexity into reviewable, measurable stages.',
  null, null,
  null, null,
  'Start with clarity.', 'A good discovery conversation saves time and reduces risk before implementation begins.',
  '[{"number":"01 / DISCOVER","icon":"⌕","title":"Discovery & scope","body":"Align on product goals, users, constraints, priorities and success criteria.","tags":["Goals","Requirements"]},{"number":"02 / DEFINE","icon":"▤","title":"Requirements & UX","body":"Map user journeys, core functionality, edge cases and content needs.","tags":["User flows","UX"]},{"number":"03 / ARCHITECT","icon":"⌘","title":"Design & architecture","body":"Choose the system structure, data model, integrations and key technical trade-offs.","tags":["Architecture","Data"]},{"number":"04 / BUILD","icon":"⚙","title":"Iterative implementation","body":"Deliver in reviewable increments with visible progress and working outcomes.","tags":["Implementation","Reviews"]},{"number":"05 / VERIFY","icon":"✓","title":"Test & validate","body":"Verify functionality, responsiveness, security and device compatibility before release.","tags":["QA","Acceptance"]},{"number":"06 / LAUNCH","icon":"↗","title":"Launch & improve","body":"Monitor, resolve issues and prioritize improvements using real usage and data.","tags":["Release","Support"]}]'::jsonb, '{"cardsEyebrow":"WHAT WE DO","cardsTitle":"Practical solutions.","cardsAccent":"Precise engineering.","cardsDescription":"Strategy, design and engineering work as one system to build digital products that scale.","proofPoints":[{"n":"01","t":"Clear engineering"},{"n":"02","t":"Built to scale"},{"n":"03","t":"Outcome focused"}],"liveSystemsEyebrow":"LIVE SYSTEMS","outroEyebrow":"NEXT STEP","heroVisual":"WorkflowGraph","stripVisuals":["SuccessMetrics","ServiceConstellation"]}'::jsonb, 'From idea to a product you can trust.',
  'A structured, flexible process gives you visibility into what we build, why it matters and how we verify, launch and improve it. We turn complexity into reviewable, measurable stages.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'insights', 'en', 'INSIGHTS / 05',
  'Better-informed', 'technical decisions.',
  'Practical principles to help product owners and engineering teams evaluate options, reduce risk and build solutions that last. This is a starter knowledge hub that can later be connected to a CMS.',
  null, null,
  null, null,
  'Have a technical question?', 'Describe the challenge and we’ll help identify the right questions before choosing a solution.',
  '[{"number":"01 / GUIDE","icon":"⌘","title":"Choosing the right technology","body":"Start with constraints, needs, team and budget—not a technology name.","tags":["Architecture","Decision making"]},{"number":"02 / GUIDE","icon":"▦","title":"When custom software makes sense","body":"When core workflows outgrow generic templates or require deeper integration and control.","tags":["Custom software","Operations"]},{"number":"03 / GUIDE","icon":"✧","title":"Introducing AI to a product","body":"Define the task, data, accuracy target, operating cost and failure handling before choosing a model.","tags":["AI","Product strategy"]},{"number":"04 / GUIDE","icon":"◈","title":"Why security starts at design","body":"Permissions, secret handling, input validation and backups are foundational—not optional extras.","tags":["Security","Reliability"]},{"number":"05 / GUIDE","icon":"↗","title":"Measuring website performance","body":"Track loading, interaction and interface errors, then improve bottlenecks using measurements.","tags":["Web","Performance"]},{"number":"06 / GUIDE","icon":"⌁","title":"When IoT is worth it","body":"When real-world data enables better decisions, automation or visibility that was not possible before.","tags":["IoT","Embedded"]}]'::jsonb, '{"cardsEyebrow":"WHAT WE DO","cardsTitle":"Practical solutions.","cardsAccent":"Precise engineering.","cardsDescription":"Strategy, design and engineering work as one system to build digital products that scale.","proofPoints":[{"n":"01","t":"Clear engineering"},{"n":"02","t":"Built to scale"},{"n":"03","t":"Outcome focused"}],"liveSystemsEyebrow":"LIVE SYSTEMS","outroEyebrow":"NEXT STEP","heroVisual":"KnowledgeFragments","stripVisuals":["SignalBeacon","WorkflowGraph"]}'::jsonb, 'Better-informed technical decisions.',
  'Practical principles to help product owners and engineering teams evaluate options, reduce risk and build solutions that last. This is a starter knowledge hub that can later be connected to a CMS.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'contact', 'en', 'CONTACT / 06',
  'Let’s understand', 'what you want to build.',
  'Whether you have clear requirements or are still exploring an idea, start with the goal, the problem and your expected timeline. We’ll turn the first conversation into practical next steps.',
  null, null,
  null, null,
  'Have a project in mind?', 'Start with a project brief or reach out to the team by email.',
  '[{"number":"01 / START","icon":"↗","title":"Start a project","body":"Share an early brief with the idea, essential features and expected timeline.","tags":["Project brief","Discovery"]},{"number":"02 / EMAIL","icon":"✉","title":"Email our team","body":"Send project details or business inquiries to our company inbox.","tags":["Business inquiries","Support"]},{"number":"03 / SCOPE","icon":"▤","title":"Set priorities","body":"Clarify what you need now, what can wait and how success will be measured.","tags":["Scope","Roadmap"]}]'::jsonb, '{"cardsEyebrow":"WHAT WE DO","cardsTitle":"Practical solutions.","cardsAccent":"Precise engineering.","cardsDescription":"Strategy, design and engineering work as one system to build digital products that scale.","proofPoints":[{"n":"01","t":"Clear engineering"},{"n":"02","t":"Built to scale"},{"n":"03","t":"Outcome focused"}],"liveSystemsEyebrow":"LIVE SYSTEMS","outroEyebrow":"NEXT STEP","heroVisual":"SignalBeacon","stripVisuals":["WorkflowGraph","KnowledgeFragments"]}'::jsonb, 'Let’s understand what you want to build.',
  'Whether you have clear requirements or are still exploring an idea, start with the goal, the problem and your expected timeline. We’ll turn the first conversation into practical next steps.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'faq', 'en', 'FAQ',
  'Clear answers', 'before we begin',
  'Helpful context on our delivery approach, project scope and how to work with Archai.',
  null, null,
  null, null,
  'Still have a question?', 'Send your question through the contact page and we will help identify the right next step.',
  '[{"number":"01","icon":"◈","title":"What kinds of projects do you build?","body":"We clarify goals, users and constraints first.","tags":["GUIDANCE","SCOPE"]},{"number":"02","icon":"✳","title":"How does a project start?","body":"Work is divided into clear phases and deliverables.","tags":["GUIDANCE","DELIVERY"]},{"number":"03","icon":"⌘","title":"How is progress tracked?","body":"We agree on regular reviews and communication.","tags":["GUIDANCE","REVIEW"]},{"number":"04","icon":"↗","title":"Can you improve an existing product?","body":"We assess the current architecture before proposing changes.","tags":["GUIDANCE","LEGACY"]}]'::jsonb, '{"cardsEyebrow":"WHAT WE DO","cardsTitle":"Practical solutions.","cardsAccent":"Precise engineering.","cardsDescription":"Strategy, design and engineering work as one system to build digital products that scale.","proofPoints":[{"n":"01","t":"Clear engineering"},{"n":"02","t":"Built to scale"},{"n":"03","t":"Outcome focused"}],"liveSystemsEyebrow":"LIVE SYSTEMS","outroEyebrow":"NEXT STEP","heroVisual":"QABubbles","stripVisuals":["KnowledgeFragments","SignalBeacon"]}'::jsonb, 'Clear answers before we begin',
  'Helpful context on our delivery approach, project scope and how to work with Archai.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'careers', 'en', 'CAREERS',
  'Build what', 'people rely on',
  'We value people who enjoy solving real problems, learning continuously and owning products end to end.',
  null, null,
  null, null,
  'Let''s meet you', 'Share your background, interests and work samples.',
  '[{"number":"01","icon":"◈","title":"Software engineering","body":"Practical problem-solving mindset.","tags":["CAREER","TEAM"]},{"number":"02","icon":"✳","title":"UI/UX design","body":"Clear communication and collaboration.","tags":["CAREER","DESIGN"]},{"number":"03","icon":"⌘","title":"AI and automation","body":"Care for quality and user experience.","tags":["CAREER","AI"]},{"number":"04","icon":"↗","title":"Embedded systems & IoT","body":"Technical curiosity and continuous learning.","tags":["CAREER","IOT"]}]'::jsonb, '{"cardsEyebrow":"WHAT WE DO","cardsTitle":"Practical solutions.","cardsAccent":"Precise engineering.","cardsDescription":"Strategy, design and engineering work as one system to build digital products that scale.","proofPoints":[{"n":"01","t":"Clear engineering"},{"n":"02","t":"Built to scale"},{"n":"03","t":"Outcome focused"}],"liveSystemsEyebrow":"LIVE SYSTEMS","outroEyebrow":"NEXT STEP","heroVisual":"DNAHelix","stripVisuals":["TeamOrbit","KnowledgeFragments"]}'::jsonb, 'Build what people rely on',
  'We value people who enjoy solving real problems, learning continuously and owning products end to end.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'case-studies', 'en', 'PUBLISHED CASE STUDIES',
  'Real work', 'tells the story',
  'This page displays featured, published projects from Archai’s database only. No fictional case studies or static project records are generated in source code.',
  null, null,
  null, null,
  null, null,
  '[]'::jsonb, '{"cardsEyebrow":"WHAT WE DO","cardsTitle":"Practical solutions.","cardsAccent":"Precise engineering.","cardsDescription":"Strategy, design and engineering work as one system to build digital products that scale.","proofPoints":[{"n":"01","t":"Clear engineering"},{"n":"02","t":"Built to scale"},{"n":"03","t":"Outcome focused"}],"liveSystemsEyebrow":"LIVE SYSTEMS","outroEyebrow":"NEXT STEP","heroVisual":"ServiceConstellation","stripVisuals":["WorkflowGraph","KnowledgeFragments"],"list":"Case studies","listDescription":"Project names, images, descriptions, technologies and links are managed through the admin dashboard.","emptyTitle":"No published case studies yet","emptyBody":"Publish a project and mark it as featured in the admin dashboard to show it here. In the meantime, explore the services or contact the team.","unavailableTitle":"Project data is unavailable","unavailableBody":"Project data could not be read. Check Supabase configuration and RLS read policies. The site does not use static project records as a replacement.","services":"Services","contact":"Contact us"}'::jsonb, 'Real work tells the story',
  'This page displays featured, published projects from Archai’s database only. No fictional case studies or static project records are generated in source code.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'projects', 'en', 'PROJECT INDEX',
  'Digital work', 'built around a clear purpose',
  'Explore projects published through the Archai admin dashboard. Every project title, image, technology, category and external link in this archive comes from the database; the website does not ship static demo project records.',
  null, null,
  null, null,
  null, null,
  '[]'::jsonb, '{"cardsEyebrow":"WHAT WE DO","cardsTitle":"Practical solutions.","cardsAccent":"Precise engineering.","cardsDescription":"Strategy, design and engineering work as one system to build digital products that scale.","proofPoints":[{"n":"01","t":"Clear engineering"},{"n":"02","t":"Built to scale"},{"n":"03","t":"Outcome focused"}],"liveSystemsEyebrow":"LIVE SYSTEMS","outroEyebrow":"NEXT STEP","heroVisual":"ServiceConstellation","stripVisuals":["WorkflowGraph","KnowledgeFragments"],"catalogue":"Explore the archive","catalogueDescription":"Search by name, or narrow results by the category and technologies saved with each project.","services":"Explore services","contact":"Discuss a new project","unconfiguredTitle":"Connect the database to show projects","unconfiguredBody":"No local project records are embedded in the source code. Configure Supabase and read permissions to display published projects managed from the admin dashboard.","errorTitle":"Project data could not be read","errorBody":"Static replacement records are disabled. Check Supabase connectivity, RLS read policies, the projects table schema and its related tables.","compatibilityTitle":"Project data loaded in compatibility mode","compatibilityBody":"Some optional fields or relations were unavailable, so the page shows only records readable from the database. Check schema migrations if images or technologies are missing.","emptyTitle":"No published projects yet","emptyBody":"Projects will appear here automatically when published from the admin dashboard. In the meantime, explore the services or discuss an idea with the team."}'::jsonb, 'Digital work built around a clear purpose',
  'Explore projects published through the Archai admin dashboard. Every project title, image, technology, category and external link in this archive comes from the database; the website does not ship static demo project records.', true
) on conflict (page_key, locale) do nothing;

insert into public.site_page_content (
  page_key, locale, eyebrow, title, accent, description, primary_label, primary_href,
  secondary_label, secondary_href, outro_title, outro_text, cards, sections,
  seo_title, seo_description, is_published
) values (
  'home', 'en', 'DIGITAL ENGINEERING / ARCHAI',
  null, null,
  'Digital products, web platforms, AI-enabled workflows, embedded systems and IoT built around real business needs.',
  'Explore our work', '/en/projects',
  'About Archai', '/en/about',
  null, null,
  '[]'::jsonb, '{"cardsEyebrow":"WHAT WE DO","cardsTitle":"Practical solutions.","cardsAccent":"Precise engineering.","cardsDescription":"Strategy, design and engineering work as one system to build digital products that scale.","proofPoints":[{"n":"01","t":"Clear engineering"},{"n":"02","t":"Built to scale"},{"n":"03","t":"Outcome focused"}],"liveSystemsEyebrow":"LIVE SYSTEMS","outroEyebrow":"NEXT STEP","heroVisual":"ServiceConstellation","heroCapabilities":["Embedded systems","Web platforms","Mobile applications"],"stripVisuals":["WorkflowGraph","KnowledgeFragments"],"sections":{"homeOverview":{"eyebrow":"From idea to launch","title":"We build connected digital systems, not just standalone pages","description":"Archai combines software engineering, design, user experience and intelligent systems to turn business needs into practical products that can grow.","capabilitiesTitle":"What can we build?","capabilities":[{"number":"01","title":"Digital products & platforms","text":"Corporate websites, commerce experiences, dashboards and web apps designed to be fast and intuitive."},{"number":"02","title":"AI & workflow automation","text":"Integrate AI into real workflows, automate repetitive tasks and build tools that help teams make better decisions."},{"number":"03","title":"Embedded systems & IoT","text":"Connect devices, sensors and physical systems with software, monitoring and control interfaces."},{"number":"04","title":"Business systems & data","text":"Internal tools, API integrations, reports and dashboards that help organize operations and track performance."}],"audienceEyebrow":"WHO WE BUILD FOR","audienceTitle":"Technology shaped around different operating contexts","audiences":[{"title":"Growing businesses","text":"Scalable platforms that can evolve as operations and customer needs grow."},{"title":"Operations teams","text":"Dashboards and integrations that reduce repetitive work and make workflows easier to monitor."},{"title":"New digital products","text":"Turn an idea into a clear scope, a testable experience and a product that can improve in stages."},{"title":"Connected environments","text":"Bring devices, sensors and software together in a system that can be monitored and maintained."}],"principlesTitle":"Principles behind every delivery","principles":[{"title":"Performance by design","text":"Loading speed, interface response and resource use are considered from the planning stage."},{"title":"Maintainable architecture","text":"Clear structure and reusable components make future changes easier to reason about."},{"title":"Practical integration","text":"APIs and data flows are designed to work with existing tools and systems when needed."},{"title":"Validate before launch","text":"Core journeys, error states and compatibility are reviewed before release."}],"processTitle":"A clear delivery process from day one","process":[{"number":"01","title":"Understand","text":"Define the problem, users and priorities before choosing technology."},{"number":"02","title":"Shape the experience","text":"Plan user flows, interfaces and architecture around real needs."},{"number":"03","title":"Build & validate","text":"Deliver in stages and review functionality, performance and compatibility."},{"number":"04","title":"Launch & improve","text":"Prepare the solution for release and identify improvements from real usage."}],"note":"Every project has its own scope and priorities. We choose tools and architecture to fit the problem instead of forcing one solution on every team.","faqEyebrow":"BEFORE WE START","faqTitle":"Questions worth answering at the start","questions":[{"q":"Can the solution integrate with our current systems?","a":"We review current tools, APIs and data flows first, then define a safe and practical integration scope."},{"q":"Can you improve a product that already exists?","a":"Yes. We can assess usability, performance and architecture, then prioritize improvements based on impact and risk."},{"q":"How are time and cost estimated?","a":"We clarify needs, constraints and priorities, then break the work into stages with a defined scope before delivery begins."}],"faqLink":"Browse all FAQs","ctaTitle":"Have an idea or a technical challenge?","ctaText":"Tell us what you want to achieve and we will help identify a practical next step and a suitable scope.","services":"Explore our services","contact":"Discuss your project"},"technology":{"eyebrow":"TECHNOLOGY STACK / 007","title":"The right tool for the real problem.","description":"We choose technologies for fit, reliability, maintainability and performance—not because a tool is trending. The stack adapts to each product''s requirements and operating constraints.","note":"Technology choices depend on each project''s scope, integrations, team and deployment environment.","link":"Explore our engineering services"},"technologyStacks":[{"en":"Frontend engineering","ar":"تطوير الواجهات","items":["React","TypeScript","Next.js","Tailwind CSS","Three.js","Framer Motion"],"tone":"violet"},{"en":"Backend & data","ar":"الخلفية والبيانات","items":["Node.js","Python","Go","Rust","PostgreSQL","Redis"],"tone":"mint"},{"en":"Embedded systems","ar":"الأنظمة المدمجة","items":["C / C++","Zephyr RTOS","FreeRTOS","ARM Cortex-M","FPGA","VHDL / Verilog"],"tone":"blue"},{"en":"AI & machine learning","ar":"الذكاء الاصطناعي وتعلم الآلة","items":["PyTorch","TensorFlow","ONNX Runtime","Hugging Face","LangChain","OpenCV"],"tone":"violet"},{"en":"Cloud & DevOps","ar":"السحابة وعمليات التطوير","items":["Kubernetes","Docker","AWS","Google Cloud","Terraform","GitLab CI"],"tone":"mint"},{"en":"IoT & connectivity","ar":"إنترنت الأشياء والاتصال","items":["MQTT","LoRaWAN","BLE","Modbus","OPC UA","Thread"],"tone":"blue"},{"en":"Mobile applications","ar":"تطبيقات الهواتف","items":["React Native","Flutter","Swift","Kotlin","Expo","Capacitor"],"tone":"violet"}],"focus":{"headingAr":"مجالاتنا الهندسية","headingEn":"ENGINEERING FOCUS","descriptionAr":"مجموعة من التخصصات التي ندمجها وفق احتياج كل منتج، وليست قائمة عملاء أو شعارات تجارية.","descriptionEn":"A practical set of disciplines we combine around each product’s needs—not a list of client brands or endorsements.","items":["DIGITAL PRODUCT ENGINEERING","AI & WORKFLOW AUTOMATION","EMBEDDED SYSTEMS","IOT & CONNECTIVITY","BUSINESS PLATFORMS","DATA & API INTEGRATION","PERFORMANCE-LED UX","INTERACTIVE 3D EXPERIENCES"]},"homeProjectsCTA":{"eyebrowAr":"أرشيف الأعمال","eyebrowEn":"PROJECT ARCHIVE","titleAr":"كل مشروع له هدف. وكل حل يبدأ بفهم المشكلة.","titleEn":"Every project has a purpose. Every solution starts by understanding the problem.","descriptionAr":"تصفح مجموعة مشروعات أركاي في صفحة مستقلة، واكتشف أنواع المنتجات الرقمية والأنظمة التي نصممها ونطورها، مع تفاصيل كل مشروع وتقنياته وروابطه المتاحة.","descriptionEn":"Explore Archai’s work in a dedicated catalogue with project details, technologies, categories and available live links—without turning the homepage into a crowded portfolio grid.","primaryAr":"استكشف كل المشروعات","primaryEn":"Explore all projects","secondaryAr":"منهجية دراسات الحالة","secondaryEn":"How we approach case studies"}}}'::jsonb, 'Software, AI & Digital Product Engineering',
  'Archai Solutions designs and builds digital products, web platforms, AI-powered workflows, and embedded and IoT systems.', true
) on conflict (page_key, locale) do nothing;
