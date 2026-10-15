# Archai Showcase — Agent Working Agreement

Before editing, read this file and `docs/design-system/MASTER.md`.

## Product intent
- A bilingual Arabic/English (`ar`/`en`) portfolio for Archai Solutions, with RTL/LTR correctness, a distinctive deep-navy/violet/mint visual identity, real project content, and accessible motion.
- Use the current Next.js App Router / React / TypeScript / Tailwind / Supabase stack. Do not add another backend or replace the existing architecture without a concrete reason.
- Keep public marketing pages polished and expressive; keep admin pages clear, fast, and information-dense rather than adding decorative animation everywhere.

## Implementation rules
- Inspect the surrounding components and existing shared patterns before creating new abstractions.
- Any new page needs localized metadata, a meaningful H1, canonical/alternate URLs, and structured data when semantically appropriate.
- 3D scenes must be lazy-mounted through `LazyVisual` unless the scene is essential to the initial hero. Keep a CSS fallback and error boundary.
- Never run multiple requestAnimationFrame loops for the same scroll effect. `SmoothMotion` is the shared desktop Lenis/GSAP bridge.
- Respect `prefers-reduced-motion`; use native scrolling on small/touch screens. Do not trap scroll or change document height after hydration.
- Use CSS transforms/opacity for motion when feasible; avoid continuous React state updates in animation loops. Keep pointer effects passive and disable them for touch input.
- Do not invent customer, delivery, satisfaction, revenue, or experience statistics. Any public metric must have a source and owner approval.
- Avoid nested `<main>` landmarks, missing image alt text, inaccessible controls, unlabelled icon buttons, and focus outlines removed without replacement.
- Keep Arabic content natural, ensure logical CSS properties are used for RTL, and test both `ar` and `en` layouts.

## Verification before handoff
1. `npm ci`
2. `npm run typecheck`
3. `npm run build`
4. Run the site with valid environment values and check `/ar`, `/en`, every public route, admin auth, project details, keyboard navigation, reduced motion, mobile layouts, console/network errors, metadata, Open Graph, and sitemap/robots.
5. Report tests actually run; never label unrun checks as passed.

## Required skill repositories
- Anthropic Frontend Design: https://github.com/anthropics/skills (skill `frontend-design`)
- UI UX Pro Max: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill (skill `ui-ux-pro-max`)
- Addy Osmani Agent Skills: https://github.com/addyosmani/agent-skills
- LLM Council: https://github.com/aiwithremy/claude-skills-llm-council

Use these as review aids, not as justification to blindly add dependencies. See `docs/skills/INSTALL-STATUS.md` for the environment's install limitation.
