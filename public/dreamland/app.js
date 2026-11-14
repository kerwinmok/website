document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

const starfieldLayers = {
    far: document.getElementById('starfield-far'),
    mid: document.getElementById('starfield-mid'),
    near: document.getElementById('starfield-near')
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

renderProceduralStarfield();
