// Central configuration for the Return to Dream Land prototype.
// Edit this file ONLY to tune colors, star counts, parallax layer speeds, or swap in real art assets.
window.DREAMLAND_CONFIG = {
    world: {
        minHeightVh: 420
    },

    // CSS custom property overrides applied to :root at startup
    palette: {
        '--kirby-pink': '#ff8fb1',
        '--kirby-pink-deep': '#ff5d8f',
        '--kirby-blush': '#ffbfd3',
        '--kirby-cheek': '#ff477e',
        '--star-yellow': '#ffe066',
        '--star-gold': '#ffb703',
        '--star-cream': '#fff6cc',
        '--cloud-white': '#fffdf9',
        '--cloud-tint': '#fdeef4',
        '--sky-top': '#1e1b4b',
        '--sky-upper': '#4c3b8d',
        '--sky-mid': '#b57edc',
        '--sky-lower': '#ffb3c6',
        '--sky-horizon': '#ffe599',
        '--surface': 'rgba(255, 253, 249, 0.86)',
        '--surface-strong': 'rgba(255, 253, 249, 0.94)',
        '--ink': '#2b1d38',
        '--muted': '#644f78',
        '--line': 'rgba(255, 143, 177, 0.38)'
    },

    // Scroll parallax multipliers (0 = fixed to viewport, higher = moves faster upward on scroll)
    layerSpeeds: {
        worldBg: 0.1,
        farStars: 0.08,
        distantClouds: 0.2,
        midStars: 0.26,
        floatingHills: 0.36,
        warpStar: 0.42,
        nearClouds: 0.54,
        foregroundStars: 0.68,
        kirbySprite: 0.28
    },

    // Scroll-linked sprite drift amplitudes
    motion: {
        warpStarSwayPx: 28,
        warpStarBobPx: 14,
        warpStarTiltDeg: 12,
        kirbyFloatXPx: 18,
        kirbyFloatYPx: 12,
        kirbyTiltDeg: 6,
        farStarMinOpacity: 0.35
    },

    // Procedural starfield generator settings (used when star layer image assets are disabled)
    stars: {
        seed: 19920427,
        colors: ['#fffdf9', '#ffe066', '#ffbfd3', '#fff6cc'],
        layers: {
            far: { count: 48, minSize: 3, maxSize: 7, sparkleRatio: 0.2 },
            mid: { count: 28, minSize: 6, maxSize: 13, sparkleRatio: 0.45 },
            near: { count: 14, minSize: 12, maxSize: 22, sparkleRatio: 0.75 }
        }
    },

    // TODO(asset): Drop real art files into public/dreamland/assets/ and flip `enabled: true`
    // on each entry below to replace the CSS/SVG placeholders without editing HTML/CSS/JS.
    assets: {
        worldBg: {
            enabled: false,
            path: 'assets/world-bg-sky.png',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
        },
        farStars: {
            enabled: false,
            path: 'assets/stars-far.png',
            backgroundSize: '960px auto',
            backgroundRepeat: 'repeat'
        },
        midStars: {
            enabled: false,
            path: 'assets/stars-mid.png',
            backgroundSize: '1200px auto',
            backgroundRepeat: 'repeat'
        },
        foregroundStars: {
            enabled: false,
            path: 'assets/stars-near.png',
            backgroundSize: '1440px auto',
            backgroundRepeat: 'repeat'
        },
        distantClouds: {
            enabled: false,
            path: 'assets/clouds-far.png',
            backgroundSize: '100% auto',
            backgroundRepeat: 'repeat-y'
        },
        floatingHills: {
            enabled: false,
            path: 'assets/dreamland-hills.png',
            backgroundSize: '100% auto',
            backgroundRepeat: 'no-repeat'
        },
        nearClouds: {
            enabled: false,
            path: 'assets/clouds-near.png',
            backgroundSize: '100% auto',
            backgroundRepeat: 'repeat-y'
        },
        warpStar: {
            enabled: false,
            path: 'assets/warp-star.png',
            alt: 'Warp Star'
        },
        kirbySprite: {
            enabled: false,
            path: 'assets/kirby-float.png',
            alt: 'Kirby floating through Dream Land'
        },
        titleCrest: {
            enabled: false,
            path: 'assets/title-crest.png',
            alt: 'Dream Land Star Crest'
        },
        abilityIcons: {
            enabled: false,
            systems: 'assets/icon-star-rod.png',
            interfaces: 'assets/icon-warp-wing.png',
            tinkering: 'assets/icon-maxim-tomato.png'
        },
        projectPreviews: {
            enabled: false,
            preview01: 'assets/stage-preview-01.png',
            preview02: 'assets/stage-preview-02.png',
            preview03: 'assets/stage-preview-03.png'
        }
    }
};
