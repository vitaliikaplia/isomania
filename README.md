# Isomania

PZ-like isometric survival game built with Three.js in the browser.

## Tech Stack

- **Three.js** (OrthographicCamera) — 2.5D isometric rendering
- **Prepros** — JS concat/minify, SCSS compilation
- **PHP** — entry point served via Laravel Herd

## Project Structure

```
├── index.php                 # Entry HTML
├── prepros.config            # Prepros build config
├── scss/
│   └── style.scss            # Styles source → css/style.min.css
├── css/
│   └── style.min.css         # Compiled CSS (Prepros output)
└── js/
    ├── game.js               # Entry point (@prepros-append)
    ├── game.min.js            # Compiled JS (Prepros output)
    ├── engine/
    │   ├── renderer.js       # Scene, camera, renderer, lighting
    │   ├── input.js          # Keyboard, mouse, context menu
    │   └── camera.js         # Camera follow, zoom, occlusion
    ├── world/
    │   ├── map.js            # Map data, BFS groups, collisions
    │   ├── terrain.js        # Ground tiles, roads, sidewalks, markings
    │   ├── buildings.js      # Building meshes, windows, doors
    │   └── trees.js          # Tree meshes
    ├── entities/
    │   ├── player.js         # Player mesh (pivot groups for animation)
    │   └── movement.js       # Movement, acceleration, walk/run animation
    ├── ui/
    │   └── hud.js            # HUD, fullscreen
    └── core/
        └── loop.js           # Game loop, resize, loading screen
```

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrow keys | Move |
| Shift + Move | Sprint |
| Scroll wheel | Zoom in/out |

## Features

- Isometric 2.5D world with Three.js OrthographicCamera
- 48x48 tile map with roads, sidewalks, buildings, trees
- PZ-style player with pivot-based walk/run animation
- Acceleration/deceleration movement physics
- PZ-style occlusion — objects between camera and player fade transparent
- Data-driven collision system (circle for trees, box for buildings)
- Dynamic shadows (PCFSoftShadowMap)
- Loading screen with name input
- Fullscreen support

## Development

1. Open the project in [Prepros](https://prepros.io/)
2. Prepros watches `js/game.js` → builds `js/game.min.js`
3. Prepros watches `scss/style.scss` → builds `css/style.min.css`
4. Serve via [Laravel Herd](https://herd.laravel.com/) at `isomania.test`
