const sections = Array.from(document.querySelectorAll('.section'));
const navLinks = Array.from(document.querySelectorAll('.top-nav a'));
const revealItems = Array.from(document.querySelectorAll('.reveal'));
const photoAlbum = document.getElementById('photo-album');
const projectSection = document.getElementById('projects');
const projectGrid = document.getElementById('project-grid');
const projectMore = document.getElementById('project-more');
let projectCards = [];
if (projectGrid) {
    projectCards = Array.from(projectGrid.querySelectorAll('.card'));
}

let showAllProjects = false;

document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

// Add or remove filenames here as your album grows.
const photoFiles = [
    'AboutMe.jpg',
    'FrontPage.jpg',
    'Projects.jpg',
    'Experience.jpg',
    'Photos.jpg'
];

const heroCycleImg = document.getElementById('hero-cycle-img');
const heroCycleCount = document.getElementById('hero-cycle-count');
const heroPrevBtn = document.getElementById('hero-prev');
const heroNextBtn = document.getElementById('hero-next');
const aboutHero = document.getElementById('about');
let currentHeroPhotoIndex = 0;

function setCurrentSection(sectionId) {
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

function syncUrlHash(sectionId) {
    const nextHash = `#${sectionId}`;

    if (window.location.hash === nextHash) {
        return;
    }

    // Keep URL aligned to the visible section without adding history entries on every scroll tick.
    history.replaceState(null, '', nextHash);
}

function createAlbumItem(fileName) {
    const item = document.createElement('figure');
    item.className = 'album-item';

    const image = document.createElement('img');
    image.loading = 'lazy';
    image.decoding = 'async';
    image.src = `assets/photos/${fileName}`;
    image.alt = fileName;

    const caption = document.createElement('figcaption');
    caption.textContent = fileName;

    image.addEventListener('error', () => {
        item.classList.add('album-placeholder');
        image.remove();
        caption.textContent = `missing file: public/assets/photos/${fileName}`;
    });

    item.append(image, caption);
    return item;
}

function renderPhotoAlbum() {
    if (!photoAlbum) {
        return;
    }

    photoFiles.forEach((fileName) => {
        photoAlbum.append(createAlbumItem(fileName));
    });
}

function applyHeroFallbackIfMissing() {
    const heroImage = new Image();
    heroImage.onload = () => {
        document.body.classList.remove('no-hero-image');
    };
    heroImage.onerror = () => {
        document.body.classList.add('no-hero-image');
    };
    heroImage.src = 'assets/photos/AboutMe.jpg';
}

function updateCurrentSectionByScroll() {
    if (!sections.length) {
        return;
    }

    const markerY = window.innerHeight * 0.38;
    let closestSection = sections[0];
    let closestDistance = Number.POSITIVE_INFINITY;

    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - markerY);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestSection = section;
        }
    });

    setCurrentSection(closestSection.id);
    syncUrlHash(closestSection.id);
}

let isTicking = false;

function requestSectionUpdate() {
    if (isTicking) {
        return;
    }

    isTicking = true;
    requestAnimationFrame(() => {
        updateCurrentSectionByScroll();
        isTicking = false;
    });
}

function updateProjectList() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const canCollapse = projectCards.length > 3;

    if (!isMobile) {
        showAllProjects = false;
    }

    if (projectGrid) {
        projectGrid.classList.toggle('is-collapsed', isMobile && canCollapse && !showAllProjects);
    }
    projectMore.hidden = !isMobile || !canCollapse;
    projectMore.setAttribute('aria-expanded', String(isMobile && showAllProjects));
    if (showAllProjects) {
        projectMore.textContent = 'show less';
    } else {
        projectMore.textContent = 'view more';
    }
}

projectMore.addEventListener('click', () => {
    showAllProjects = !showAllProjects;
    updateProjectList();

    if (!showAllProjects) {
        projectSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

function enableFloatyWheelScroll() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (prefersReducedMotion || !hasFinePointer) {
        return;
    }

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let animationId = 0;

    const easing = 0.12;
    const intensity = 0.9;
    const stopThreshold = 0.45;

    function clampTarget(nextValue) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        return Math.min(Math.max(nextValue, 0), Math.max(maxScroll, 0));
    }

    function animateScroll() {
        currentY += (targetY - currentY) * easing;

        if (Math.abs(targetY - currentY) <= stopThreshold) {
            currentY = targetY;
        }

        window.scrollTo(0, currentY);

        if (currentY !== targetY) {
            animationId = requestAnimationFrame(animateScroll);
            return;
        }

        animationId = 0;
    }

    window.addEventListener(
        'wheel',
        (event) => {
            if (event.ctrlKey) {
                return;
            }

            event.preventDefault();
            targetY = clampTarget(targetY + event.deltaY * intensity);

            if (!animationId) {
                animationId = requestAnimationFrame(animateScroll);
            }
        },
        { passive: false }
    );

    window.addEventListener(
        'scroll',
        () => {
            if (!animationId) {
                currentY = window.scrollY;
                targetY = currentY;
            }
        },
        { passive: true }
    );
}

const revealObserver = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.15
    }
);

if ('IntersectionObserver' in window) {
    revealItems.forEach((item) => revealObserver.observe(item));
} else {
    // Older browsers get immediate visibility and no scroll-tracking effects.
    revealItems.forEach((item) => item.classList.add('is-visible'));
}

window.addEventListener('scroll', requestSectionUpdate, { passive: true });
window.addEventListener('resize', () => {
    requestSectionUpdate();
    updateProjectList();
});
enableFloatyWheelScroll();

const initialSectionId = (window.location.hash || '').replace('#', '');
const hasInitialSection = sections.some((section) => section.id === initialSectionId);

if (hasInitialSection) {
    setCurrentSection(initialSectionId);
} else {
    setCurrentSection('about');
}
updateCurrentSectionByScroll();
        isTicking = false;
    });
}

function updateProjectList() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const canCollapse = projectCards.length > 3;

    if (!isMobile) {
        showAllProjects = false;
    }

    if (projectGrid) {
        projectGrid.classList.toggle('is-collapsed', isMobile && canCollapse && !showAllProjects);
    }
    projectMore.hidden = !isMobile || !canCollapse;
    projectMore.setAttribute('aria-expanded', String(isMobile && showAllProjects));
    if (showAllProjects) {
        projectMore.textContent = 'show less';
    } else {
        projectMore.textContent = 'view more';
    }
}

projectMore.addEventListener('click', () => {
    showAllProjects = !showAllProjects;
    updateProjectList();

    if (!showAllProjects) {
        projectSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

function enableFloatyWheelScroll() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (prefersReducedMotion || !hasFinePointer) {
        return;
    }

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let animationId = 0;

    const easing = 0.12;
    const intensity = 0.9;
    const stopThreshold = 0.45;

    function clampTarget(nextValue) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        return Math.min(Math.max(nextValue, 0), Math.max(maxScroll, 0));
    }

    function animateScroll() {
        currentY += (targetY - currentY) * easing;

        if (Math.abs(targetY - currentY) <= stopThreshold) {
            currentY = targetY;
        }

        window.scrollTo(0, currentY);

        if (currentY !== targetY) {
            animationId = requestAnimationFrame(animateScroll);
            return;
        }

        animationId = 0;
    }

    window.addEventListener(
        'wheel',
        (event) => {
            if (event.ctrlKey) {
                return;
            }

            event.preventDefault();
            targetY = clampTarget(targetY + event.deltaY * intensity);

            if (!animationId) {
                animationId = requestAnimationFrame(animateScroll);
            }
        },
        { passive: false }
    );

    window.addEventListener(
        'scroll',
        () => {
            if (!animationId) {
                currentY = window.scrollY;
                targetY = currentY;
            }
        },
        { passive: true }
    );
}

const revealObserver = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.15
    }
);

if ('IntersectionObserver' in window) {
    revealItems.forEach((item) => revealObserver.observe(item));
} else {
    // Older browsers get immediate visibility and no scroll-tracking effects.
    revealItems.forEach((item) => item.classList.add('is-visible'));
}

window.addEventListener('scroll', requestSectionUpdate, { passive: true });
window.addEventListener('resize', () => {
    requestSectionUpdate();
    updateProjectList();
});
enableFloatyWheelScroll();

const initialSectionId = (window.location.hash || '').replace('#', '');
const hasInitialSection = sections.some((section) => section.id === initialSectionId);

if (hasInitialSection) {
    setCurrentSection(initialSectionId);
} else {
    setCurrentSection('about');
}
function initHeroBike() {
    if (!bikeCanvas || typeof THREE === 'undefined') {
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(3.05, 1.15, 3.85);
    camera.lookAt(0, -0.05, 0);

    const renderer = new THREE.WebGLRenderer({
        canvas: bikeCanvas,
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.78);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ea, 1.25);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x5ea2ff, 0.9);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    const bikeGroup = new THREE.Group();
    bikeGroup.scale.set(1.08, 1.08, 1.08);
    scene.add(bikeGroup);

    const suzukiBlue = new THREE.MeshStandardMaterial({
        color: 0x0f4cd9,
        metalness: 0.45,
        roughness: 0.24
    });
    const fairingBlack = new THREE.MeshStandardMaterial({
        color: 0x15181e,
        metalness: 0.3,
        roughness: 0.42
    });
    const stripeWhite = new THREE.MeshStandardMaterial({
        color: 0xf4f6fa,
        metalness: 0.2,
        roughness: 0.3
    });
    const tireRubber = new THREE.MeshStandardMaterial({
        color: 0x111215,
        metalness: 0.05,
        roughness: 0.85
    });
    const metalSteel = new THREE.MeshStandardMaterial({
        color: 0xbac2cc,
        metalness: 0.82,
        roughness: 0.22
    });
    const darkMetal = new THREE.MeshStandardMaterial({
        color: 0x262a31,
        metalness: 0.65,
        roughness: 0.35
    });
    const forkGold = new THREE.MeshStandardMaterial({
        color: 0xd4a63a,
        metalness: 0.78,
        roughness: 0.25
    });

    function createSportWheel(radius, tireTube) {
        const wheel = new THREE.Group();

        const tire = new THREE.Mesh(
            new THREE.TorusGeometry(radius, tireTube, 20, 42),
            tireRubber
        );
        wheel.add(tire);

        const rimStrip = new THREE.Mesh(
            new THREE.TorusGeometry(radius - tireTube * 0.55, 0.015, 12, 36),
            suzukiBlue
        );
        wheel.add(rimStrip);

        const hub = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.16, 18),
            darkMetal
        );
        hub.rotation.x = Math.PI / 2;
        wheel.add(hub);

        for (let i = 0; i < 6; i += 1) {
            const angle = (i * Math.PI) / 3;
            const spoke = new THREE.Mesh(
                new THREE.BoxGeometry(0.032, radius * 1.55, 0.025),
                fairingBlack
            );
            spoke.rotation.z = angle;
            wheel.add(spoke);
        }

        const rotor = new THREE.Mesh(
            new THREE.CylinderGeometry(radius * 0.56, radius * 0.56, 0.014, 28),
            metalSteel
        );
        rotor.rotation.x = Math.PI / 2;
        rotor.position.z = 0.065;
        wheel.add(rotor);

        return wheel;
    }

    const rearWheel = createSportWheel(0.46, 0.13);
    rearWheel.position.set(-1.02, -0.32, 0);
    bikeGroup.add(rearWheel);

    const frontWheel = createSportWheel(0.45, 0.115);
    frontWheel.position.set(1.06, -0.33, 0);
    bikeGroup.add(frontWheel);

    const engineBlock = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.44, 0.34),
        darkMetal
    );
    engineBlock.position.set(-0.08, -0.12, 0);
    bikeGroup.add(engineBlock);

    const lowerCowl = new THREE.Mesh(
        new THREE.BoxGeometry(0.86, 0.24, 0.38),
        fairingBlack
    );
    lowerCowl.position.set(0.08, -0.3, 0);
    lowerCowl.rotation.z = -0.08;
    bikeGroup.add(lowerCowl);

    const mainFairing = new THREE.Mesh(
        new THREE.BoxGeometry(0.82, 0.48, 0.44),
        suzukiBlue
    );
    mainFairing.position.set(0.42, 0.12, 0);
    mainFairing.rotation.z = -0.22;
    bikeGroup.add(mainFairing);

    const fairingStripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.68, 0.09, 0.46),
        stripeWhite
    );
    fairingStripe.position.set(0.4, 0.1, 0);
    fairingStripe.rotation.z = -0.32;
    bikeGroup.add(fairingStripe);

    const noseCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.26, 0.56, 20),
        suzukiBlue
    );
    noseCone.rotation.z = -Math.PI / 2 - 0.15;
    noseCone.position.set(0.88, 0.25, 0);
    bikeGroup.add(noseCone);

    const headlight = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.13, 0.2),
        new THREE.MeshStandardMaterial({
            color: 0xeaf6ff,
            emissive: 0x99ccff,
            emissiveIntensity: 0.65
        })
    );
    headlight.position.set(1.06, 0.24, 0);
    headlight.rotation.z = -0.2;
    bikeGroup.add(headlight);

    const windscreen = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.24, 0.34),
        new THREE.MeshStandardMaterial({
            color: 0x8fb6d9,
            transparent: true,
            opacity: 0.45,
            metalness: 0.2,
            roughness: 0.1
        })
    );
    windscreen.position.set(0.68, 0.46, 0);
    windscreen.rotation.z = -0.58;
    bikeGroup.add(windscreen);

    const fuelTank = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 24, 18),
        suzukiBlue
    );
    fuelTank.scale.set(1.55, 0.82, 0.85);
    fuelTank.position.set(-0.02, 0.34, 0);
    bikeGroup.add(fuelTank);

    const riderSeat = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.12, 0.3),
        fairingBlack
    );
    riderSeat.position.set(-0.48, 0.24, 0);
    riderSeat.rotation.z = 0.08;
    bikeGroup.add(riderSeat);

    const tailCowl = new THREE.Mesh(
        new THREE.ConeGeometry(0.21, 0.68, 16),
        suzukiBlue
    );
    tailCowl.rotation.z = Math.PI / 2 + 0.26;
    tailCowl.position.set(-0.92, 0.38, 0);
    bikeGroup.add(tailCowl);

    const tailLight = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.06, 0.16),
        new THREE.MeshStandardMaterial({
            color: 0xff2a2a,
            emissive: 0xcc1111,
            emissiveIntensity: 0.7
        })
    );
    tailLight.position.set(-1.22, 0.44, 0);
    bikeGroup.add(tailLight);

    const forkOffsets = [-0.11, 0.11];
    forkOffsets.forEach((zOffset) => {
        const forkTube = new THREE.Mesh(
            new THREE.CylinderGeometry(0.032, 0.028, 0.92, 14),
            forkGold
        );
        forkTube.position.set(0.84, 0.04, zOffset);
        forkTube.rotation.z = 0.44;
        bikeGroup.add(forkTube);
    });

    const handlebar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.62, 12),
        darkMetal
    );
    handlebar.rotation.x = Math.PI / 2;
    handlebar.position.set(0.56, 0.38, 0);
    bikeGroup.add(handlebar);

    const swingarm = new THREE.Mesh(
        new THREE.BoxGeometry(0.76, 0.09, 0.26),
        darkMetal
    );
    swingarm.position.set(-0.64, -0.24, 0);
    swingarm.rotation.z = 0.12;
    bikeGroup.add(swingarm);

    const exhaustCan = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.06, 0.78, 18),
        fairingBlack
    );
    exhaustCan.rotation.z = Math.PI / 2 - 0.34;
    exhaustCan.position.set(-0.62, -0.1, 0.22);
    bikeGroup.add(exhaustCan);

    const exhaustTip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.076, 0.065, 0.14, 18),
        metalSteel
    );
    exhaustTip.rotation.z = Math.PI / 2 - 0.34;
    exhaustTip.position.set(-0.98, 0.02, 0.22);
    bikeGroup.add(exhaustTip);

    const shadowDisc = new THREE.Mesh(
        new THREE.CircleGeometry(1.65, 36),
        new THREE.MeshBasicMaterial({
            color: 0x050608,
            transparent: true,
            opacity: 0.36
        })
    );
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = -0.89;
    scene.add(shadowDisc);

    function resizeBikeViewport() {
        const width = bikeCanvas.clientWidth || 360;
        const height = bikeCanvas.clientHeight || 280;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    let targetYaw = -0.45;
    let currentYaw = -0.45;
    let dragOffsetYaw = 0;
    let isDraggingBike = false;
    let lastPointerX = 0;
    let idleAngle = 0;

    function syncBikeScrollRotation() {
        const scrollRatio = window.scrollY / Math.max(window.innerHeight, 1);
        targetYaw = -0.45 + scrollRatio * Math.PI * 2.2 + dragOffsetYaw;
    }

    bikeCanvas.addEventListener('pointerdown', (event) => {
        isDraggingBike = true;
        lastPointerX = event.clientX;
        bikeCanvas.setPointerCapture(event.pointerId);
    });

    bikeCanvas.addEventListener('pointermove', (event) => {
        if (!isDraggingBike) {
            return;
        }
        const deltaX = event.clientX - lastPointerX;
        lastPointerX = event.clientX;
        dragOffsetYaw += deltaX * 0.012;
        syncBikeScrollRotation();
    });

    bikeCanvas.addEventListener('pointerup', () => {
        isDraggingBike = false;
    });

    bikeCanvas.addEventListener('pointercancel', () => {
        isDraggingBike = false;
    });

    function animateBike() {
        idleAngle += 0.004;
        currentYaw += (targetYaw + idleAngle - currentYaw) * 0.08;
        bikeGroup.rotation.y = currentYaw;
        bikeGroup.position.y = Math.sin(idleAngle * 3) * 0.03;

        const wheelSpin = window.scrollY * 0.018;
        frontWheel.rotation.z = -wheelSpin;
        rearWheel.rotation.z = -wheelSpin;

        renderer.render(scene, camera);
        requestAnimationFrame(animateBike);
    }

    window.addEventListener('scroll', syncBikeScrollRotation, { passive: true });
    window.addEventListener('resize', resizeBikeViewport);
    resizeBikeViewport();
    syncBikeScrollRotation();
    animateBike();
}

function updateHeroPhoto(nextIndex) {
    if (!photoFiles.length) {
        return;
    }

    const total = photoFiles.length;
    currentHeroPhotoIndex = ((nextIndex % total) + total) % total;
    const fileName = photoFiles[currentHeroPhotoIndex];
    const imagePath = `assets/photos/${fileName}`;

    if (heroCycleImg) {
        heroCycleImg.src = imagePath;
    }

    if (heroCycleCount) {
        heroCycleCount.textContent = `${currentHeroPhotoIndex + 1} / ${total}`;
    }

    if (aboutHero) {
        aboutHero.style.setProperty('--hero-bg', `url("${imagePath}")`);
    }
}

function initHeroPhotoCycler() {
    if (!heroCycleImg) {
        return;
    }

    if (heroPrevBtn) {
        heroPrevBtn.addEventListener('click', () => {
            updateHeroPhoto(currentHeroPhotoIndex - 1);
        });
    }

    if (heroNextBtn) {
        heroNextBtn.addEventListener('click', () => {
            updateHeroPhoto(currentHeroPhotoIndex + 1);
        });
    }

    heroCycleImg.addEventListener('click', () => {
        updateHeroPhoto(currentHeroPhotoIndex + 1);
    });

    updateHeroPhoto(0);
}

updateCurrentSectionByScroll();
renderPhotoAlbum();
applyHeroFallbackIfMissing();
updateProjectList();
initHeroPhotoCycler();
