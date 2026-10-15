# Single-click navigation + starfield hotfix

Extract this ZIP over the existing project root, allowing these files to be replaced:

- `src/components/Header.tsx`
- `src/components/visuals/GalaxyBackground.tsx`
- `scripts/verify-source.mjs`
- `docs/NAVIGATION-SINGLE-CLICK-STARFIELD-REVIEW-2026-10-15.md`

The patch intentionally does not include `.env.local`, `node_modules`, `.next`, or other user-specific environment files.

After copying, run:

```powershell
npm run verify:source
npm run typecheck
npm run build
npm run dev
```

Then test `/ar/projects` by clicking the header link once on desktop and mobile.
