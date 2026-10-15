# Archai mobile responsiveness pass — 2026-10-15

## Changes
- Added a mobile/tablet responsive layer for global wrappers, headings, descriptions, hero spacing, hero CTAs, admin forms, stat cards, and horizontally scrollable tables.
- Prevented horizontal page overflow while allowing intentional table overflow in `.table-wrap`.
- Kept mobile form controls at 16px minimum to avoid iOS focus zoom.
- Increased tap targets to at least 46px for primary buttons and ensured `touch-action: manipulation`.
- Added consistent visible keyboard focus rings.
- Reduced touch-device hover transformations and spotlight effects to avoid hover artifacts and unnecessary rendering work.
- Added reduced-motion overrides for users who request less animation.
- Preserved the existing desktop layout and the existing 3D visual system; mobile sizing changes are CSS-only and avoid adding client-side JavaScript.

## Validation status
- Source review completed for the global stylesheet and homepage Hero.
- Full production build, real-device visual QA, and Lighthouse run are not claimed as completed in this environment. Run the project commands below and inspect at 320px, 375px, 390px, 430px, 768px, 1024px, and desktop widths.

## Suggested verification
1. `npm run verify:source`
2. `npm run typecheck`
3. `npm run build`
4. `npm run start`
5. Chrome DevTools device emulation plus one real iOS/Android device; check horizontal overflow, mobile menu, forms, project cards, 3D loading, page navigation, and keyboard focus.
6. Lighthouse mobile for Home, Projects archive, Project detail, Contact, and Admin (authenticated separately).

## Performance principles
Keep the initial hero visual lightweight on mobile, defer below-the-fold 3D/canvas work, use `next/image` with explicit dimensions for content imagery, and use measured Core Web Vitals rather than assuming CSS changes alone guarantee a score.
