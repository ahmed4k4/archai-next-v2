# Visual redesign V4 — full 3D content language

## Direction
The visual system now treats 3D as part of the information architecture rather than decorative background noise.

### Homepage
- Rebuilt the HeroCore around a premium central faceted core, two restrained orbital rings, three floating dashboard surfaces and small dimensional accent blocks.
- Removed moving grid/line language from the hero.
- Added a separate calm 3D ambient field to the full homepage.
- Added slow depth animation to homepage service/process/principle cards.

### Marketing pages
- All mapped marketing pages keep topic-specific WebGL backdrops.
- Removed remaining WebGL `gridHelper` floors from Industries and Case Studies.
- Added a semantic `ThreeDContentStage` for each page topic: product ecosystem, service system, industry map, connected team, delivery flow, knowledge core, contact signal, outcome loop, collaboration, answer core, project stack and solution set.
- Marketing content cards now sit inside a perspective 3D stage with layered surfaces, translate-Z content, floating depth and restrained idle motion.
- Existing mid-page WebGL scenes remain and continue to use content-specific symbols.

### Motion rules
- No fast-moving line fields or animated grids.
- Movement is slow and low amplitude: floating surfaces, object breathing, orbital rotation and light/depth changes.
- Mobile reduces scale/opacity and motion intensity.
- `prefers-reduced-motion` disables the decorative animation layers.

## Validation
Static syntax validation should be run after edits, followed by `npm install`, `npm run typecheck`, and `npm run build` in the project environment.
