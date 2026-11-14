# Return to Dream Land Prototype — Developer & Agent Handoff Notes

## 1. What This Prototype Is

This is a self-contained vertical-scroll interface prototype themed after *Kirby's Return to Dream Land*, located in `public/dreamland/`. It is built in the exact same stack as the main personal website (plain HTML5, CSS3 custom properties, and vanilla JavaScript with zero build step or external framework dependencies) and is served cleanly alongside the untouched root resume site (`public/index.html`).

All visual elements currently use non-copyrighted CSS gradients, procedural DOM stars, and inline SVG shapes as placeholders so that custom artwork can be dropped in later by editing a single configuration file (`public/dreamland/config.js`).

---

## 2. File Structure

```text
website/
├── DEV_NOTES.md                      # This handoff document
├── public/
│   ├── index.html                    # Main resume site (untouched)
│   ├── app.js                        # Main resume site script (untouched)
│   └── dreamland/                    # Isolated Return to Dream Land prototype
│       ├── index.html                # Prototype markup, parallax stage, and 3 content sections
│       ├── styles.css                # Dream Land palette, layer layout, cards, and reduced-motion rules
│       ├── config.js                 # Single source of truth for colors, speeds, star counts, and asset paths
│       ├── app.js                    # Starfield generator, asset swapper, and rAF scroll parallax engine
│       └── assets/
│           └── README.md             # Expected asset filenames, rough dimensions, and layer descriptions
├── scripts/
│   ├── open-static.ps1               # Opens public/index.html directly
│   └── run-local.ps1                 # Compiles and runs server/ResumeServer.java on port 8080
└── server/
    └── ResumeServer.java             # Lightweight Java static file server for public/
```

---

## 3. How the Scroll & Parallax System Works

1. **Two-Plane Architecture**:
   - `#dreamland-viewport` (`position: fixed; inset: 0; pointer-events: none; z-index: 0`) holds 9 stacked `.parallax-layer` elements (`[data-parallax-layer]`).
   - `#dreamland-world` (`position: relative; z-index: 2; min-height: var(--world-min-height)`) holds the scrollable foreground content stages (`#sky-gate`, `#cookie-clouds`, `#star-quests`, `#halcandra-horizon`).
2. **Compositor-Only Updates (No Layout Thrash)**:
   - Layout metrics (`window.innerHeight`, `document.documentElement.scrollHeight`, and each `.section`'s vertical center via `offsetTop + offsetHeight * 0.5`) are cached once at startup and on `resize` inside `cacheLayoutMetrics()`.
   - Scroll events are registered with `{ passive: true }` and gated by an `isScrollTicking` flag into `requestAnimationFrame(applyParallaxTransforms)`.
   - Inside `applyParallaxTransforms(scrollY)`, no layout-triggering DOM reads occur. Each `[data-parallax-layer]` node is translated solely with `translate3d(0, -scrollY * speed, 0)` and optional `opacity` adjustments.
   - The `#warp-star-anchor` and `#kirby-traveler` sprite containers apply a gentle sinusoidal sway, bob, and rotation computed purely from normalized scroll progress (`scrollY / cachedMaxScroll`).
3. **Accessibility (`prefers-reduced-motion: reduce`)**:
   - CSS `@media (prefers-reduced-motion: reduce)` disables smooth scroll and strips transforms/transitions on all parallax layers, sprites, stars, buttons, and cards.
   - In `public/dreamland/app.js`, `window.matchMedia('(prefers-reduced-motion: reduce)')` is checked at startup and observed for live changes. When active, `resetParallaxTransforms()` clears inline transforms while keeping the active navigation highlight and altitude readout functional.

---

## 4. Where the Config Lives (`public/dreamland/config.js`)

All tunable parameters live in `public/dreamland/config.js` on `window.DREAMLAND_CONFIG`:

- `world.minHeightVh`: Total height of the vertical world in `vh` units (default `420`).
- `palette`: Maps CSS variable names (`--kirby-pink`, `--star-yellow`, `--sky-top` through `--sky-horizon`, surface and ink colors) to their hex/rgba values and applies them to `:root` on load.
- `layerSpeeds`: Scroll speed multiplier for each `data-parallax-layer` (`worldBg`, `farStars`, `distantClouds`, `midStars`, `floatingHills`, `warpStar`, `nearClouds`, `foregroundStars`, `kirbySprite`).
- `motion`: Sway/bob/tilt amplitudes for the Warp Star and Kirby traveler sprites, plus minimum far-star opacity.
- `stars`: Deterministic PRNG `seed`, star `colors` array, and per-layer (`far`, `mid`, `near`) `count`, `minSize`, `maxSize`, and `sparkleRatio`.
- `assets`: Paths, sizing rules, and `enabled` flags for every replaceable visual asset.

---

## 5. Expected Assets (`public/dreamland/assets/`)

See `public/dreamland/assets/README.md` for the full specification table. Summary of expected files:

- `world-bg-sky.png` (`1920x4320`) — Full vertical Dream Land sky background.
- `stars-far.png` (`960x960`), `stars-mid.png` (`1200x1200`), `stars-near.png` (`1440x1440`) — Seamless tiled star layers (replace procedural DOM stars when enabled).
- `clouds-far.png` (`1920x2160`), `clouds-near.png` (`1920x2160`) — Distant and foreground cloud layers.
- `dreamland-hills.png` (`1920x2400`) — Floating pastel islands and hills backdrop.
- `warp-star.png` (`256x256`) — Warp Star vehicle sprite.
- `kirby-float.png` (`256x256`) — Floating character sprite.
- `title-crest.png` (`128x128`) — Hero card star emblem.
- `icon-star-rod.png`, `icon-warp-wing.png`, `icon-maxim-tomato.png` (`96x96`) — Stage 01 ability card icons.
- `stage-preview-01.png`, `stage-preview-02.png`, `stage-preview-03.png` (`640x360`) — Stage 02 project card preview thumbnails.

---

## 6. Current Status: What's Done vs. What's Still a Placeholder

### Done
- Isolated `/dreamland/` prototype route with zero modifications to the existing root website.
- 9-layer `requestAnimationFrame` parallax engine using `translate3d` and `opacity` with `{ passive: true }` scroll listeners and cached layout metrics.
- Deterministic procedural starfield generator with both dot stars and 4-point sparkle stars across 3 depth layers.
- Full Dream Land pastel sky gradient and Kirby-pink / warm-yellow UI theme.
- Hero stage (`#sky-gate`) plus 3 scrollable content sections (`#cookie-clouds`, `#star-quests`, `#halcandra-horizon`).
- Automatic asset loader in `app.js` driven by `config.js` with `TODO(asset)` comments marking every placeholder slot in HTML, CSS, and JS.
- Full `prefers-reduced-motion: reduce` support in both CSS and JS.

### Still a Placeholder
- All background artwork (sky gradient, cloud bands, floating hills) is currently drawn with CSS gradients and inline SVGs.
- Starfield layers are procedurally generated DOM spans rather than illustrated textures.
- Kirby traveler, Warp Star, title crest, ability badges, and project thumbnails are geometric SVG/CSS placeholders.
- Section text and project cards contain placeholder Dream Land copy rather than final portfolio items.

---

## 7. Short To-Do List for the Next Agent

1. **Drop Real Artwork into `public/dreamland/assets/`**: Add the PNG/WebP/SVG files listed in `public/dreamland/assets/README.md`.
2. **Enable Assets in `public/dreamland/config.js`**: Flip `enabled: true` on each populated asset entry in `window.DREAMLAND_CONFIG.assets` and fine-tune `layerSpeeds` if the illustrated layers need different vertical travel rates.
3. **Replace Placeholder Portfolio Copy**: Populate `#cookie-clouds`, `#star-quests`, and `#halcandra-horizon` in `public/dreamland/index.html` with real bio details, project links, and work timeline entries from `public/index.html`.
4. **Link Prototype or Promote to Main**: Once artwork and copy are finalized, either add a link from the main site's `.top-nav` to `/dreamland/` or promote the Dream Land layout when ready to merge into `main`.
