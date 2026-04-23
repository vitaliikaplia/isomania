# Isomania

Isomania is a browser-based isometric survival prototype inspired by classic zombie sandbox games and built with Three.js.

## Live Project

- Website: [https://isomania.online/](https://isomania.online/)

## Screenshot

![Isomania Screenshot](./screenshot.png)

## Overview

The project focuses on a stylized 2.5D world, procedural neighborhood generation, readable isometric navigation, and lightweight browser delivery without a heavyweight bundler setup.

## Core Highlights

- Procedurally generated `192x192` world with roads, sidewalks, houses, fences, gates, trees, and small structures
- Isometric rendering with `THREE.OrthographicCamera`
- Player movement with acceleration, sprinting, crouching, adaptive ground height, and pivot-based animation
- Occlusion system for buildings, trees, and fences between camera and player
- Segment-based fence and gate collision to prevent clipping through barriers
- Interactive split-screen start experience with live character preview and appearance controls
- Ambient soundtrack, start-screen music, and randomized footstep playback
- PHP-powered session bootstrap, cache busting, and Telegram login notifications
- GeoIP-enriched backend session info for Telegram alerts

## Controls

| Input | Action |
| ----- | ------ |
| `WASD` / Arrow keys | Move |
| `Shift` + move | Sprint |
| `C` | Toggle crouch / stealth walk |
| Mouse wheel | Zoom in / out |

## Tech Stack

- `Three.js` for rendering and scene management
- `Prepros` for JS concatenation and SCSS compilation
- `SCSS` for source styles
- `PHP` for entrypoint rendering, session handling, and backend notifications
- `GeoIP2` for location lookup in Telegram session alerts

## Project Structure

```text
├── index.php                  # Entry HTML, session bootstrap, asset versioning
├── notify.php                 # Backend endpoint for Telegram login notifications
├── composer.json              # PHP dependencies
├── geo/                       # GeoIP databases
├── prepros.config             # Prepros build configuration
├── scss/style.scss            # Source styles
├── css/style.min.css          # Compiled styles
└── js/
    ├── game.js                # Prepros entry file and append order
    ├── game.min.js            # Built runtime bundle
    ├── core/
    │   ├── config.js          # Shared runtime configuration
    │   └── loop.js            # Loader flow and main loop
    ├── engine/
    │   ├── audio.js           # Ambient, footsteps, and start-screen audio logic
    │   ├── renderer.js        # Scene, camera, renderer, lights, occlusion registry
    │   ├── input.js           # Input handling
    │   └── camera.js          # Camera follow, zoom, occlusion updates
    ├── world/
    │   ├── world-data.js      # Procedural world data generation
    │   ├── map.js             # Coordinate helpers and collision queries
    │   ├── terrain.js         # Ground tiles, curbs, road markings, signs
    │   ├── buildings.js       # Buildings, fences, gates, small structures
    │   └── trees.js           # Tree rendering
    ├── entities/
    │   ├── player.js          # Player rig, materials, and appearance palette hooks
    │   └── movement.js        # Player movement and animation
    └── ui/
        ├── start-screen.js    # Loader preview, character customization, intro music
        └── hud.js             # HUD and fullscreen toggle
```

## Gameplay / Systems

- Procedural block layout with seeded randomness
- Two-speed movement model with acceleration and deceleration
- Player occlusion handling for obstructing world geometry
- Data-driven collision for solid world objects
- Fence and wicket collision based on rendered segment shape rather than coarse tile checks
- Player name persistence through `localStorage`
- Start-screen character customization for hair, shirt, pants, and shoes
- Interactive preview character that reacts to cursor movement on the intro screen
- Telegram notification when a player enters the game
- Ambient street audio and randomized footstep playback through a dedicated audio layer
- Separate intro music loop for the start screen

## Development Notes

- JavaScript source files are concatenated through `@prepros-append` in `js/game.js`
- Project files do not use local `import` / `export` between gameplay modules
- Styling source lives in `scss/style.scss` and compiles to `css/style.min.css`
- After changing source JS or SCSS, rebuild the generated assets through `Prepros`

## Remote World Experiment

The project can also bootstrap a real-world inspired map instead of the procedural neighborhood.

- Set `WORLD_SOURCE=osm` to build the world from OpenStreetMap geometry
- Set `WORLD_SOURCE=hybrid` to combine OSM geometry with optional Google enrichment
- Configure `MAP_CENTER_LAT`, `MAP_CENTER_LNG`, and `MAP_RADIUS_METERS` in `.env`
- Cached upstream responses and final world snapshots are stored in `cache/`
- Use `.env.example` as the starting point for the required keys and parameters

## Audio Assets

Place generated audio files in the following directories:

```text
audio/
├── ambient/
│   └── street.mp3
└── footsteps/
    ├── step-01.wav
    ├── step-02.wav
    ├── step-03.wav
    ├── step-04.wav
    ├── step-05.wav
    └── step-06.wav
└── screen/
    └── start.mp3
```

Recommended export settings:

- Ambient street loops: `MP3`, `44.1 kHz`, stereo, around `192 kbps`, `60–120s`
- Footsteps: `WAV`, `44.1 kHz`, `16-bit`, preferably mono, short dry one-shots
- Start screen music: `MP3`, `44.1 kHz`, stereo
