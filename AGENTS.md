# Agents

Guidelines for AI agents working on this project.

## Architecture

- **Build system**: Prepros (not npm/webpack). Files are concatenated via `@prepros-append` in `js/game.js`, NOT ES module import/export between project files.
- **Single ES import**: `import * as THREE from 'three'` in `game.js` — resolved via importmap in `index.php` from CDN.
- **All JS files** share a single global scope after Prepros concatenation. No `export`/`import` between project files.
- **Order matters**: `@prepros-append` order in `game.js` defines dependency order. Check it before adding new files.
- **Asset versioning**: `index.php` uses `filemtime()` for cache busting. No manual version bumps needed.

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
- **Occlusion**: Objects that can block camera→player must be in `occludables` array with `userData.occludable = true` and `transparent: true` materials. Group all parts of a building/tree/fence into a single `THREE.Group`.
- **Player mesh**: Uses pivot groups (`legPivotL/R`, `armPivotL/R`, `upperBody`, `headGroup`) for animation. Animate pivots, not meshes directly.
- **Input**: Uses `e.code` (not `e.key`) for keyboard layout independence. `clearKeys()` on blur/focus/visibilitychange.
- **Map generation**: Procedural with seeded random (`srand()`/`rand()`). Tile types: 0=grass, 1=building, 2=tree, 3=crate, 4=road, 5=sidewalk, 6=fence, 7=wicket gate.
- **Performance**: Use `InstancedMesh` for repeated geometry (terrain tiles). Group similar materials. Avoid creating individual meshes in loops over the full map.

## Scale Reference

- 1 tile = 1 unit ≈ 2.5 meters
- Player height: ~0.72 units (1.8m) after 0.55 scale factor
- Buildings: 1.4–3.4 units tall (1-2 floors, ~1.4-1.7 per floor)
- Trees: ~4.25 units tall (~10m)
- Walk speed: 1.3 u/s (~12 km/h), Run speed: 2.6 u/s (~23 km/h)
- Map: 192x192 tiles (480x480m)

## Common Pitfalls

- Do NOT use `import`/`export` between project JS files — Prepros concat won't resolve them.
- Do NOT use `Object.assign` to set `position`/`rotation`/`scale` on Three.js objects — they are read-only. Use `.set()` or `.copy()`.
- Materials that participate in occlusion must have `transparent: true` set at creation time.
- Player `keys` object uses `e.code` values (`KeyW`, `KeyA`, `ShiftLeft`), not `e.key`.
- After adding a new `.js` file, add `@prepros-append` line to `js/game.js` in correct dependency order.
- Fence/gate rendering uses neighbor checks (`MAP[r][c+1]`, `MAP[r+1][c]`) for rail connections. Gate (type 7) uses same logic as fence (type 6) but with shorter/thinner elements.
- Building windows must skip the door zone on ground floor front wall (`Math.abs(wx - cx) < 0.35`).
- Gable roofs use `BufferGeometry` with 6 vertices (not ExtrudeGeometry) to avoid positioning issues.
