# Console error triage and fixes

## Fixed in this revision

- `R3F: Hooks can only be used within the Canvas component`: `HeroCore` was calling `useFrame` in its outer component, before `Scene3D` created the R3F `<Canvas>`. The clock/reveal hook now lives in `HeroScene`, which is rendered as a child inside the canvas.
- `Cannot update a component (HotReload) while rendering a different component (HeroCore)`: this was a development overlay side-effect of the invalid R3F hook/context. The hook has been moved into the canvas scene.
- `/icon.svg` returning HTTP 500 / manifest icon invalid: removed the duplicate App Router icon route and kept a validated `public/icon.svg` used by metadata and the manifest.
- Framer Motion scroll measurement warning: the reusable `ParallaxLayer` scroll target now has `position: relative`.
- `animate opacity from undefined to 1`: reduced-motion stats now start from explicit final values instead of `initial={false}` with an opacity animation target.
- Mobile GPU load: the Hero glass transmission uses lower sample/resolution settings on narrow viewports; post-processing and camera parallax are disabled on mobile/low-power devices. Off-screen 3D panels unmount outside the viewport to release WebGL resources.
- Unverified marketing metrics: removed unsupported claims such as fixed client counts, years of experience, project totals and satisfaction percentages from the Hero/About statistics. The replacement metrics describe the site's actual languages, capability areas and delivery stages.

## Not application errors

- `contentScript.js`, `i18next: initialized`, `languageChanged`, and `redirectionChainSiteScript.js` are injected by browser extensions/content scripts, not imports in this Next.js project. Verify in a private/incognito window with extensions disabled.
- `reload.js` trying `ws://127.0.0.1:5500/ws` belongs to the VS Code Live Server browser client. This app runs with `npm run dev` on port 3000; close Live Server or its browser injection rather than changing the Next.js app to use port 5500.

## Validation limits

The current environment has no installed `node_modules`, and npm's offline cache does not contain every package. TypeScript/TSX syntax transpilation and local relative-import checks pass, but a real `next build` and browser verification still need to be run after `npm install` in the developer environment.
