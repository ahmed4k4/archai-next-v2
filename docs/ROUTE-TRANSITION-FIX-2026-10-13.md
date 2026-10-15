# Route intro animation fix — 2026-10-13

## Root cause

`RouteTransition` used an isomorphic layout effect that depended on `useReducedMotion()`. When that value changed from its initial value after mount, React cleaned up the effect and canceled the only fallback timer. The subsequent run saw the same pathname and returned early, leaving the curtain mounted forever. React Strict Mode's development-only setup/cleanup/setup cycle could trigger the same class of issue because the old setup marked the route as visited before its timer survived cleanup.

## Changes

- Transition lifetime is now keyed to pathname; a reduced-motion preference update cannot cancel the only close timer.
- Interrupted setup on the same path is explicitly recovered, including Strict Mode development replay.
- The visual-ready event remains an optimization; guaranteed fallback and force-hide timers close the curtain even if WebGL fails, a page has no Canvas, or an animation promise is interrupted.
- Changing the OS reduced-motion preference to reduce exits immediately without waiting for the animation.
- Updated the transition overlay into a compact orbital Archai brand animation with subtle star drift, responsive type, and a lightweight progress trace. It unmounts when the transition completes, so its decorative infinite loops do not run behind the site.
- Added `public/.well-known/appspecific/com.chrome.devtools.json` with `{}`. Chrome DevTools requests this path for Automatic Workspace discovery during local debugging; the empty JSON stops the 404 noise without exposing a local absolute path or workspace UUID.

## Validation performed

- TypeScript/TSX parse validation with the installed TypeScript transpiler.
- CSS parse validation with PostCSS.
- JSON parse validation for the DevTools metadata file.
- Static assertions for the transition dependency list, strict-mode recovery, fallback timer, force-hide safety timer, and reduced-motion exit path.
- Full `next build` and live browser verification were not available because project `node_modules` are not installed in this environment.
