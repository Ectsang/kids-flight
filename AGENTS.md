# AGENTS.md

## Overview

Static HTML/CSS/JS collection of 7 offline-first kids games. No build system, no npm, no tests.

## Commands

- **Deploy:** Push to `main` branch. GitHub Actions auto-deploys to https://ectsang.github.io/kids-flight/
- **Local dev:** Open any `index.html` directly in browser, or serve via `npx serve .`

## Adding Games

1. Create new folder (e.g., `my-game/`)
2. Add self-contained `index.html` (can include inline CSS/JS or separate files)
3. Add link card to root `index.html`
4. Add `manifest.webmanifest` + `service-worker.js` (copy from another game), register the SW in `app.js`, and add the game's files to the root `service-worker.js` ASSETS list

## Service Workers

Every game and the root launcher is an installable PWA with its own `service-worker.js`. Conventions:

- Cache names use the `@@CACHE_STAMP@@` placeholder, replaced with the commit SHA by the deploy workflow — never hardcode version numbers.
- Each worker only deletes caches with its own name prefix on activate (caches are origin-wide and shared by all workers).
- Icons live in `animal-tap-parade/assets/icons/` and are shared by all manifests.

## Project Structure

| Folder | Description |
|--------|-------------|
| `animal-tap-parade/` | Ages 2-4: tap animals, hear sounds |
| `little-learners/` | Ages 2-5: shapes, letters, colors, numbers, patterns |
| `sky-pilot/` | Ages 2-6: flappy-bird style game |
| `bubble-pop-tower/` | Ages 4+: bubble drop physics puzzle |
| `number-cruncher/` | Ages 8+: mental math |
| `mind-grid/` | Ages 6+: memory pattern game |
| `tea-party-talk/` | Ages 3+: illustrated conversation cards and turn-taking |

Each game folder is self-contained with its own assets, styles, and service worker (for offline PWA).