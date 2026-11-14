document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

const starfieldLayers = {
    far: document.getElementById('starfield-far'),
    mid: document.getElementById('starfield-mid'),
    near: document.getElementById('starfield-near')
};

const parallaxNodes = Array.from(document.querySelectorAll('[data-parallax-layer]'));
const sections = Array.from(document.querySelectorAll('.section'));
const navLinks = Array.from(document.querySelectorAll('.top-nav a[href^="#"]'));
const altitudePill = document.getElementById('sky-altitude-pill');
const warpStarAnchor = document.getElementById('warp-star-anchor');
const kirbyTraveler = document.getElementById('kirby-traveler');

const defaultLayerSpeeds = {
    worldBg: 0.1,
    farStars: 0.08,
    distantClouds: 0.2,
    midStars: 0.26,
    floatingHills: 0.36,
    warpStar: 0.42,
    nearClouds: 0.54,
    foregroundStars: 0.68,
    kirbySprite: 0.28
};

const defaultStarSettings = {
    seed: 19920427,
    colors: ['#fffdf9', '#ffe066', '#ffbfd3', '#fff6cc'],
    layers: {
        far: { count: 48, minSize: 3, maxSize: 7, sparkleRatio: 0.2 },
        mid: { count: 28, minSize: 6, maxSize: 13, sparkleRatio: 0.45 },
        near: { count: 14, minSize: 12, maxSize: 22, sparkleRatio: 0.75 }
    }
};

let cachedMaxScroll = 1;
let cachedViewportHeight = window.innerHeight || 1;
let cachedSectionCenters = [];
let isScrollTicking = false;
let isResizeTicking = false;
let lastActiveSectionId = '';

function createSeededRandom(seedValue) {
    let state = seedValue >>> 0;
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

function createStarElement(rng, layerRule, palette) {
    const star = document.createElement('span');
    const isSparkle = rng() < layerRule.sparkleRatio;
    const size = layerRule.minSize + rng() * (layerRule.maxSize - layerRule.minSize);
    const xPercent = rng() * 98 + 1;
    const yVh = rng() * 170 + 2;
    const baseOpacity = (0.45 + rng() * 0.55).toFixed(2);
    const color = palette[Math.floor(rng() * palette.length)];

    star.className = isSparkle ? 'dream-star is-sparkle' : 'dream-star is-dot';
    star.style.width = `${size.toFixed(1)}px`;
    star.style.height = `${size.toFixed(1)}px`;
    star.style.left = `${xPercent.toFixed(2)}%`;
    star.style.top = `${yVh.toFixed(2)}vh`;
    star.style.opacity = baseOpacity;
    star.style.setProperty('--star-color', color);
    star.dataset.baseOpacity = baseOpacity;
    star.dataset.twinklePhase = (rng() * Math.PI * 2).toFixed(2);

    return star;
}

// TODO(asset): When real star layer textures (assets/stars-far.png, assets/stars-mid.png, assets/stars-near.png)
// are enabled in config.js, procedural stars are skipped in favor of the artwork layers.
function renderProceduralStarfield(starSettings = defaultStarSettings) {
    const rng = createSeededRandom(starSettings.seed);
    const colors = starSettings.colors;

    Object.entries(starfieldLayers).forEach(([key, container]) => {
        if (!container || container.classList.contains('has-real-asset')) {
            return;
        }

        const rule = starSettings.layers[key];
        if (!rule) {
            return;
        }

        container.replaceChildren();
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < rule.count; i += 1) {
            fragment.append(createStarElement(rng, rule, colors));
        }

        container.append(fragment);
    });
}

function cacheLayoutMetrics() {
    cachedViewportHeight = window.innerHeight || 1;
    const docHeight = document.documentElement.scrollHeight || cachedViewportHeight;
    cachedMaxScroll = Math.max(docHeight - cachedViewportHeight, 1);

    cachedSectionCenters = sections.map((section) => ({
        id: section.id,
        centerY: section.offsetTop + section.offsetHeight * 0.5
    }));
}

function setCurrentNavSection(sectionId) {
    if (!sectionId || sectionId === lastActiveSectionId) {
        return;
    }

    lastActiveSectionId = sectionId;
    navLinks.forEach((link) => {
        const isCurrent = link.getAttribute('href') === `#${sectionId}`;
        link.classList.toggle('is-current', isCurrent);
        if (isCurrent) {
            link.setAttribute('aria-current', 'true');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

function updateActiveSectionFromScroll(scrollY) {
    if (!cachedSectionCenters.length) {
        return;
    }

    const focusY = scrollY + cachedViewportHeight * 0.38;
    let closest = cachedSectionCenters[0];
    let minDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < cachedSectionCenters.length; i += 1) {
        const item = cachedSectionCenters[i];
        const distance = Math.abs(item.centerY - focusY);
        if (distance < minDistance) {
            minDistance = distance;
            closest = item;
        }
    }

    setCurrentNavSection(closest.id);
}

function applyParallaxTransforms(scrollY, layerSpeeds = defaultLayerSpeeds) {
    const progress = Math.min(Math.max(scrollY / cachedMaxScroll, 0), 1);

    for (let i = 0; i < parallaxNodes.length; i += 1) {
        const node = parallaxNodes[i];
        const layerKey = node.dataset.parallaxLayer;
        const speed = layerSpeeds[layerKey] ?? 0.2;
        const offsetY = -scrollY * speed;

        node.style.transform = `translate3d(0, ${offsetY.toFixed(2)}px, 0)`;

        if (layerKey === 'farStars') {
            const starFade = Math.max(1 - progress * 0.45, 0.35);
            node.style.opacity = starFade.toFixed(3);
        }
    }

    if (warpStarAnchor) {
        const swayX = Math.sin(progress * Math.PI * 3) * 28;
        const bobY = Math.cos(progress * Math.PI * 4) * 14;
        const tiltDeg = Math.sin(progress * Math.PI * 3) * 12;
        warpStarAnchor.style.transform = `translate3d(${swayX.toFixed(1)}px, ${bobY.toFixed(1)}px, 0) rotate(${tiltDeg.toFixed(1)}deg)`;
    }

    if (kirbyTraveler) {
        const floatX = Math.cos(progress * Math.PI * 2.5) * 18;
        const floatY = Math.sin(progress * Math.PI * 5) * 12;
        const bobTilt = Math.sin(progress * Math.PI * 2.5) * 6;
        kirbyTraveler.style.transform = `translate3d(${floatX.toFixed(1)}px, ${floatY.toFixed(1)}px, 0) rotate(${bobTilt.toFixed(1)}deg)`;
    }

    if (altitudePill) {
        const altitudePercent = Math.round((1 - progress) * 100);
        const zoneLabel = progress < 0.33 ? 'starlight' : progress < 0.72 ? 'cloud sea' : 'golden horizon';
        altitudePill.textContent = `altitude: ${altitudePercent}% ${zoneLabel}`;
    }

    updateActiveSectionFromScroll(scrollY);
}

function requestParallaxFrame() {
    if (isScrollTicking) {
        return;
    }

    isScrollTicking = true;
    requestAnimationFrame(() => {
        applyParallaxTransforms(window.scrollY);
        isScrollTicking = false;
    });
}

function requestMetricsRecalc() {
    if (isResizeTicking) {
        return;
    }

    isResizeTicking = true;
    requestAnimationFrame(() => {
        cacheLayoutMetrics();
        applyParallaxTransforms(window.scrollY);
        isResizeTicking = false;
    });
}

renderProceduralStarfield();
cacheLayoutMetrics();
applyParallaxTransforms(window.scrollY);

window.addEventListener('scroll', requestParallaxFrame, { passive: true });
window.addEventListener('resize', requestMetricsRecalc, { passive: true });
