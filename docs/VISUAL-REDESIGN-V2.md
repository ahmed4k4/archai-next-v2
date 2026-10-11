# Visual redesign v2 — product-engineering 3D

## Goals
- Replace the abstract, visually busy home hero with a single visual metaphor for Archai's work: connected product interfaces around a central engineering core.
- Use restrained violet/mint materials and slower motion so the hero supports rather than competes with the page copy.
- Keep page-specific WebGL backdrops mapped to the content themes: services, industries, company/team, process, insights, contact, case studies, careers, FAQ, projects and categories.
- Give marketing cards a consistent glass/3D depth treatment with accessible reduced-motion behavior and a responsive fallback.
- Replace the repeated generic marketing-section heading with page-specific bilingual copy for every marketing route.

## Implementation
- `src/components/visuals/HeroCore.tsx`: rebuilt as a layered dashboard sculpture with three floating interface panels, a restrained central core and two orbital paths.
- `src/components/marketing/MarketingPage.tsx`: page-specific bilingual section copy; page-key data attribute and matching ambient-field class; shared 3D card treatment.
- `src/components/HomeGrowthSections.tsx`: applied the shared 3D treatment to service, process and engineering principle cards.
- `src/components/Hero.tsx`: adjusted hero scene placement/opacity and semantic classes to reduce competition with the headline.
- `src/app/styles/globals.css`: consistent card depth, subtle page-themed ambient shapes, light-theme treatment, mobile simplification and reduced-motion overrides.

## Verification
- TypeScript/TSX transpile syntax pass: 101 files, zero syntax errors.
- This is a static syntax pass, not a full `next build`; install project dependencies and run `npm run build` in the deployment environment.
