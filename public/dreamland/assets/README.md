# Dream Land Prototype Assets

Drop final artwork into this folder (`public/dreamland/assets/`) using the exact filenames below, then set `enabled: true` for each corresponding entry in `public/dreamland/config.js` under `window.DREAMLAND_CONFIG.assets`. No HTML, CSS, or JavaScript edits are required outside `config.js`.

## Expected Asset Files

| Filename | Rough Dimensions | Format | Config Key | One-Line Description |
| :--- | :--- | :--- | :--- | :--- |
| `world-bg-sky.png` | `1920 x 4320 px` (tall vertical) | PNG / WebP | `assets.worldBg` | Full tall Dream Land vertical sky background transitioning from deep starfield to warm golden horizon. |
| `stars-far.png` | `960 x 960 px` (seamless tile) | PNG (transparent) | `assets.farStars` | Distant tiny starfield layer that tiles seamlessly and scrolls at the slowest parallax speed. |
| `stars-mid.png` | `1200 x 1200 px` (seamless tile) | PNG (transparent) | `assets.midStars` | Mid-depth pastel star and sparkle layer moving at an intermediate parallax speed. |
| `stars-near.png` | `1440 x 1440 px` (seamless tile) | PNG (transparent) | `assets.foregroundStars` | Large foreground 4-point star sparkles that pass quickly in front of the cloud banks. |
| `clouds-far.png` | `1920 x 2160 px` (vertical repeat) | PNG (transparent) | `assets.distantClouds` | Soft distant lavender, cream, and pink cloud bands that sit behind the floating hills. |
| `dreamland-hills.png` | `1920 x 2400 px` | PNG (transparent) | `assets.floatingHills` | Midground floating Dream Land islands and checkerboard pastel hills. |
| `clouds-near.png` | `1920 x 2160 px` (vertical repeat) | PNG (transparent) | `assets.nearClouds` | Fluffy foreground cloud puffs that drift rapidly across the edges of the viewport. |
| `warp-star.png` | `256 x 256 px` | PNG / SVG | `assets.warpStar` | Glowing yellow Warp Star vehicle sprite that sways and tilts along the scroll path. |
| `kirby-float.png` | `256 x 256 px` | PNG / SVG | `assets.kirbySprite` | Floating pink traveler character sprite positioned in the upper-left sky lane. |
| `title-crest.png` | `128 x 128 px` | PNG / SVG | `assets.titleCrest` | Decorative star emblem displayed at the top of the Stage 00 hero card. |
| `icon-star-rod.png` | `96 x 96 px` | PNG / SVG | `assets.abilityIcons.systems` | Copy-ability badge icon for the Systems & Backend card in Stage 01. |
| `icon-warp-wing.png` | `96 x 96 px` | PNG / SVG | `assets.abilityIcons.interfaces` | Copy-ability badge icon for the Interactive Interfaces card in Stage 01. |
| `icon-maxim-tomato.png` | `96 x 96 px` | PNG / SVG | `assets.abilityIcons.tinkering` | Copy-ability badge icon for the Creative Tinkering card in Stage 01. |
| `stage-preview-01.png` | `640 x 360 px` (`16:9`) | PNG / WebP | `assets.projectPreviews.preview01` | Thumbnail preview image for the first featured project card in Stage 02. |
| `stage-preview-02.png` | `640 x 360 px` (`16:9`) | PNG / WebP | `assets.projectPreviews.preview02` | Thumbnail preview image for the second featured project card in Stage 02. |
| `stage-preview-03.png` | `640 x 360 px` (`16:9`) | PNG / WebP | `assets.projectPreviews.preview03` | Thumbnail preview image for the third featured project card in Stage 02. |

## How Fallbacks Work

- While `enabled: false` in `config.js` (or if an image fails to load), the prototype renders pure CSS/SVG/DOM placeholders with zero broken image icons or network 404 errors.
- Flipping `enabled: true` on any asset object in `config.js` preloads the image and automatically adds `.has-real-asset` to its container, hiding the placeholder SVG/gradient and displaying the real asset.
