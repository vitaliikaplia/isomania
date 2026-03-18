# Agents

Guidelines for AI agents working on this project.

## Architecture

- **Build system**: Prepros (not npm/webpack). Files are concatenated via `@prepros-append` in `js/game.js`, NOT ES module import/export between project files.
- **Single ES import**: `import * as THREE from 'three'` in `game.js` — resolved via importmap in `index.php` from CDN.
- **All JS files** share a single global scope after Prepros concatenation. No `export`/`import` between project files.
- **Order matters**: `@prepros-append` order in `game.js` defines dependency order. Check it before adding new files.

## Conventions

- **Language**: Code in English, comments in English. User communication in Ukrainian.
- **Styles**: Source in `scss/style.scss`, output `css/style.min.css`. Use SCSS nesting.
- **JS modules**: One concern per file. Add new files to the appropriate directory:
  - `engine/` — rendering, input, camera, audio
  - `world/` — map, terrain, buildings, trees, weather
  - `entities/` — player, NPCs, zombies
  - `systems/` — inventory, crafting, combat
  - `ui/` — HUD, menus, dialogs
  - `core/` — game loop, state management
- **Collision**: Data-driven via `COLLIDERS` object in `map.js`. Circle or box shapes per tile type.
- **Occlusion**: Objects that can block camera→player must be in `occludables` array with `userData.occludable = true` and `transparent: true` materials.
- **Player mesh**: Uses pivot groups (`legPivotL/R`, `armPivotL/R`, `upperBody`, `headGroup`) for animation. Animate pivots, not meshes directly.
- **Input**: Uses `e.code` (not `e.key`) for keyboard layout independence.

## Scale Reference

- 1 tile = 1 unit ≈ 2.5 meters
- Player height: ~0.72 units (1.8m) after 0.55 scale factor
- Buildings: 2.5–4.2 units tall (6–10m)
- Trees: ~4.25 units tall (~10m)

## Common Pitfalls

- Do NOT use `import`/`export` between project JS files — Prepros concat won't resolve them.
- Materials that participate in occlusion must have `transparent: true` set at creation time.
- Player `keys` object uses `e.code` values (`KeyW`, `KeyA`, `ShiftLeft`), not `e.key`.
- After adding a new `.js` file, add `@prepros-append` line to `js/game.js` in correct dependency order.
