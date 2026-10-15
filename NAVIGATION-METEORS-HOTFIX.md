# Archai navigation + starfield hotfix

Apply these files by preserving the directory structure and overwriting the existing files in your project:

- `src/components/Header.tsx`
- `src/components/visuals/GalaxyBackground.tsx`
- `src/app/styles/globals.css`
- `scripts/verify-source.mjs`

Then run:

```powershell
npm run verify:source
npm run typecheck
npm run build
```

The hotfix fixes unstable primary-nav component identity, prefetches navigation routes on intent, closes the mobile drawer on selection, and increases meteor activity within device-performance limits.
