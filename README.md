# Isomania

PZ-like isometric survival game built with Three.js in the browser.

## Tech Stack

- **Three.js** (OrthographicCamera) — 2.5D isometric rendering
- **Prepros** — JS concat/minify, SCSS compilation
- **PHP** — entry point served via Laravel Herd

## Project Structure

```
├── index.php                 # Entry HTML (PHP for asset versioning)
├── prepros.config            # Prepros build config
├── favicon.svg / .ico / .png # Favicons
├── scss/
│   └── style.scss            # Styles source → css/style.min.css
├── css/
│   └── style.min.css         # Compiled CSS (Prepros output)
└── js/
    ├── game.js               # Entry point (@prepros-append)
    ├── game.min.js            # Compiled JS (Prepros output)
    ├── engine/
    │   ├── renderer.js       # Scene, camera, renderer, lighting
    │   ├── input.js          # Keyboard (e.code), mouse, context menu
    │   └── camera.js         # Camera follow, zoom, PZ-style occlusion
    ├── world/
    │   ├── map.js            # Procedural map (192x192), BFS groups, collisions
    │   ├── terrain.js        # InstancedMesh terrain, roads, sidewalks, curbs, markings, yield signs
    │   ├── buildings.js      # Buildings (1-2 floors, gable/flat roofs), fences, wicket gates
    │   └── trees.js          # Tree meshes (trunk + foliage layers)
    ├── entities/
    │   ├── player.js         # Player mesh (pivot groups for animation)
    │   └── movement.js       # Movement, acceleration/deceleration, walk/run
    ├── ui/
    │   └── hud.js            # HUD, fullscreen
    └── core/
        └── loop.js           # Game loop, resize, loading screen, name input
```

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrow keys | Move |
| Shift + Move | Sprint |
| Scroll wheel | Zoom in/out (0.4x — 10x) |

## Features

- **World**: 192x192 procedurally generated tile map with seeded random
- **Roads**: 5x5 road grid with asphalt, sidewalks, curbs, dashed lane markings
- **Buildings**: 1-2 floor houses with gable/flat roofs, windows per floor, doors with frames, foundations
- **Fences**: Wooden fences around ~45% of buildings with wicket gates facing roads
- **Traffic signs**: Yield signs on secondary roads at intersections
- **Trees**: Multi-layered foliage with trunk collision only
- **Player**: PZ-style adult proportions, pivot-based walk/run animation (arms from shoulders, legs from hips)
- **Movement**: Acceleration/deceleration physics, walk (~8 km/h) and sprint (~16 km/h)
- **Occlusion**: Buildings/trees/fences fade to near-transparent when blocking camera→player view
- **Collision**: Data-driven system — circle colliders for trees/fences, box for buildings/crates
- **Terrain**: InstancedMesh rendering for performance (~15 draw calls instead of 37k)
- **Shadows**: PCFSoftShadowMap with light following player
- **Loading screen**: Logo, progress bar, name input (saved to localStorage), Play button
- **Cache busting**: PHP `filemtime()` versioning for Cloudflare compatibility

## Development

1. Open the project in [Prepros](https://prepros.io/)
2. Prepros watches `js/game.js` → builds `js/game.min.js`
3. Prepros watches `scss/style.scss` → builds `css/style.min.css`
4. Serve via [Laravel Herd](https://herd.laravel.com/) at `isomania.test`
