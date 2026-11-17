const sections = Array.from(document.querySelectorAll('.section'));
const navLinks = Array.from(document.querySelectorAll('.top-nav a'));
const revealItems = Array.from(document.querySelectorAll('.reveal'));
const photoAlbum = document.getElementById('photo-album');
const photoLightbox = document.getElementById('photo-lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
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

const photoFiles = [
    'gsx250r-road.jpg',
    'gsx250r-cat-1.jpg',
    'gsx250r-cat-2.jpg'
];


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

    image.addEventListener('error', () => {
        item.remove();
    });

    item.addEventListener('click', () => {
        openLightbox(image.src, fileName);
    });

    item.append(image);
    return item;
}

function openLightbox(src, altText) {
    if (!photoLightbox || !lightboxImg) {
        return;
    }

    photoLightbox.classList.remove('is-zoomed');
    lightboxImg.src = src;
    lightboxImg.alt = altText;
    photoLightbox.hidden = false;
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    if (!photoLightbox || !lightboxImg) {
        return;
    }

    photoLightbox.hidden = true;
    photoLightbox.classList.remove('is-zoomed');
    lightboxImg.src = '';
    document.body.style.overflow = '';
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

// smooth wheel scroll with momentum coasting for desktop mice and trackpads
function enableFloatyWheelScroll() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (prefersReducedMotion || !hasFinePointer) {
        return;
    }

    // turn off native css smooth scroll so each animation frame doesn't restart a transition
    document.documentElement.classList.add('has-smooth-scroll');

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let velocityY = 0;
    let lastWheelTime = 0;
    let lastFrameTime = 0;
    let animationId = 0;

    // tuned so wheel stops glide slightly before settling
    const baseEasing = 0.085;
    const velocityFriction = 0.88;
    const wheelIntensity = 1.05;
    const velocityImpulse = 0.28;
    const maxVelocity = 140;
    const stopThreshold = 0.08;

    // convert line/page wheel units into pixels and cap huge trackpad spikes
    function normalizeWheelDelta(event) {
        let delta = event.deltaY;

        if (event.deltaMode === 1) {
            delta *= 40;
        } else if (event.deltaMode === 2) {
            delta *= window.innerHeight * 0.85;
        }

        return Math.min(Math.max(delta, -240), 240);
    }

    function getMaxScroll() {
        return Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    }

    function clampTarget(nextValue) {
        return Math.min(Math.max(nextValue, 0), getMaxScroll());
    }

    function animateScroll(now) {
        if (!lastFrameTime) {
            lastFrameTime = now;
        }

        // keep the same glide feel on 60hz and 120hz+ displays
        const elapsed = Math.min(Math.max((now - lastFrameTime) / 16.667, 0.25), 3.0);
        lastFrameTime = now;

        // bleed remaining wheel velocity into the target so stopping slows down naturally
        if (Math.abs(velocityY) > stopThreshold) {
            const maxScroll = getMaxScroll();
            const nextTarget = clampTarget(targetY + velocityY * elapsed);

            if ((nextTarget <= 0 && velocityY < 0) || (nextTarget >= maxScroll && velocityY > 0)) {
                velocityY *= 0.4;
            }

            targetY = nextTarget;
            velocityY *= Math.pow(velocityFriction, elapsed);
        }

        const easeStep = 1 - Math.pow(1 - baseEasing, elapsed);
        currentY += (targetY - currentY) * easeStep;

        if (Math.abs(targetY - currentY) <= stopThreshold && Math.abs(velocityY) <= stopThreshold) {
            currentY = targetY;
            velocityY = 0;
        }

        window.scrollTo(0, currentY);

        if (currentY !== targetY || Math.abs(velocityY) > stopThreshold) {
            animationId = requestAnimationFrame(animateScroll);
            return;
        }

        velocityY = 0;
        lastFrameTime = 0;
        animationId = 0;
    }

    window.addEventListener(
        'wheel',
        (event) => {
            if (event.ctrlKey) {
                return;
            }

            if (photoLightbox && !photoLightbox.hidden) {
                return;
            }

            event.preventDefault();
            const delta = normalizeWheelDelta(event);
            if (delta === 0) {
                return;
            }

            const now = performance.now();

            // drop old coasting velocity right away if i reverse direction
            if ((delta > 0 && targetY < currentY - 2) || (delta < 0 && targetY > currentY + 2)) {
                targetY = currentY;
                velocityY = 0;
            }

            const wheelGap = now - lastWheelTime;
            lastWheelTime = now;

            let boost = 1.0;
            if (wheelGap > 0 && wheelGap < 140) {
                boost = 1.2;
            }

            targetY = clampTarget(targetY + delta * wheelIntensity * boost);
            velocityY = Math.min(Math.max(velocityY + delta * velocityImpulse * boost, -maxVelocity), maxVelocity);

            if (!animationId) {
                lastFrameTime = now;
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
                velocityY = 0;
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

if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
        closeLightbox();
    });
}

if (lightboxImg && photoLightbox) {
    lightboxImg.addEventListener('click', (event) => {
        event.stopPropagation();
        photoLightbox.classList.toggle('is-zoomed');
    });
}

if (photoLightbox) {
    photoLightbox.addEventListener('click', (event) => {
        if (event.target === photoLightbox) {
            closeLightbox();
        }
    });
}

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && photoLightbox && !photoLightbox.hidden) {
        closeLightbox();
    }
});

function formatAgeInYearsAndMonths(birthDate, targetDate) {
    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();

    if (targetDate.getDate() < birthDate.getDate()) {
        months -= 1;
    }

    if (months < 0) {
        years -= 1;
        months += 12;
    }

    return `${years} yrs ${months} mos old`;
}

function updateTimelineAgeTooltips() {
    const birthDate = new Date(2006, 11, 21);
    const startWorkDate = new Date(2021, 7, 30);
    const nowDate = new Date();

    const startAgeText = formatAgeInYearsAndMonths(birthDate, startWorkDate);
    const currentAgeText = formatAgeInYearsAndMonths(birthDate, nowDate);

    const startTips = Array.from(document.querySelectorAll('[data-age-start]'));
    const nowTips = Array.from(document.querySelectorAll('[data-age-now]'));

    startTips.forEach((tip) => {
        tip.textContent = startAgeText;
    });

    nowTips.forEach((tip) => {
        tip.textContent = currentAgeText;
    });
}

updateCurrentSectionByScroll();
renderPhotoAlbum();
applyHeroFallbackIfMissing();
updateProjectList();
updateTimelineAgeTooltips();
